---
id: odometrie-pid
title: Odométrie par Fusion et Asservissement PID
description: Calcul de la position absolue du robot par fusion de capteurs (filtre complémentaire) et exploitation par les boucles d'asservissement PID de la Teensy Moteur.
slug: odometrie-pid
sidebar_label: Odométrie & PID
tags: [cdr, nantes, robotique, teensy]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

Ce module documente la façon dont la Teensy Moteur calcule la position absolue du robot (X, Y, Theta) en combinant plusieurs sources de données matérielles, et comment elle exploite ces informations via ses boucles PID.

## 1. Topologie des Capteurs

La version finale post-CDR embarque trois sources principales de télémétrie.

1. **Encodeurs MKS SERVO57D** : Reliés en RS485. Interrogés en rafale asynchrone à 100Hz pour calculer les vitesses différentielles.
2. **Centrale Inertielle BNO085 (IMU)** : Connectée en I2C. Fournit un quaternion matériel absolu converti en cap ($\theta$) via le rapport `SH2_GAME_ROTATION_VECTOR` configuré à 100Hz.
3. **Capteur Optique (PAA5100)** : Connecté en I2C. Fournit des variations locales en (X, Y). Remplace les roues codeuses traditionnelles pour mesurer le glissement. Pas fiable avec la faible luminosité du robot, nous avons essayé de rajouter des leds mais cela n'a pas fonctionné.

:::warning Filtre de Kalman (EKF) et Teensy Capteur
Un **Filtre de Kalman Étendu (EKF)** a été prototypé et partiellement implémenté dans la branche `main`, mais il n'est pas activé. En parallèle, une architecture matérielle déportée sur une **Teensy Capteur** dédiée a été étudiée (branche `feature/teensy_capteur`) mais abandonnée. L'implémentation décrite ci-dessous repose sur une fusion maison simplifiée (Filtre Complémentaire Adaptatif) hébergée directement sur la Teensy Moteur principale. (Voir [Teensy Capteur et EKF](../features/teensy-capteur.md).)
:::

## 2. Logique de Fusion (Filtre Complémentaire)

Le calcul odométrique, réalisé dans `update_odometry()`, applique plusieurs règles pour pallier les défauts physiques de chaque capteur.

### Rejet des données optiques aberrantes (Outliers)

Le capteur de flux optique peut décrocher (poussière, reflet). Le code filtre brutalement toute variation de position supérieure à **15 mm** entre deux cycles (10 ms) comme étant physiquement impossible (vitesse implicite > 1.5 m/s).

### Détection de Rotation Pure

Les capteurs de flux optique perdent drastiquement en précision lors des rotations sur place (effet centrifuge et tangage matériel). Le code désactive **totalement** l'intégration du capteur optique si une rotation pure est détectée.
Une rotation pure est validée par les encodeurs lorsque :

- La variation de vitesse de rotation angulaire calculée `abs(omega) > 0.005` rad (soit ~0.3°).
- Le sens de rotation des 3 roues est identique.
- La vitesse de rotation est répartie de manière quasi-homogène sur les 3 moteurs (écart de vitesse < 20% par rapport à la moyenne, `d_diff < 0.2`).

> `robot1/teensy_moteur/lib/holonomic_basis/src/holonomic_basis.cpp`

```cpp
      bool is_pure_rotation = false;
      if (abs(omega_temp) > 0.005) { // Rotation détectée (> 0.005 rad = 0.3°)
          // Vérifier si les 3 roues tournent dans le même sens
          // ...
          bool same_sign = (d1 * d2 > 0) && (d2 * d3 > 0);

          // Vérifier vitesses similaires (tolérance 20% pour imprécisions)
          double d_avg = (d1_abs + d2_abs + d3_abs) / 3.0;
          if (d_avg > 50.0) { // Mouvement significatif (>50 counts)
              // ...
              // Rotation pure = même signe ET vitesses similaires (<20% écart)
              if (same_sign && d1_diff < 0.2 && d2_diff < 0.2 && d3_diff < 0.2) {
                  is_pure_rotation = true;
              }
          }
      }
  ```

Durant ces phases, la translation (X,Y) est contrainte à zéro.

### Pondération (Filtre Complémentaire Adaptatif)

Lorsque le robot se translate de manière fiable, la position (X,Y) est un mélange (Blend) entre l'optique et les encodeurs.
La constante $\alpha$ définie dans le code régit ce ratio :

$$ d_{\text{final}} = \alpha \cdot d_{\text{encodeur}} + (1 - \alpha) \cdot d_{\text{optique}} $$

- **Cas Nominal** : `ALPHA = 0.20`. Le robot fait confiance à **80% au capteur optique** (vrai déplacement) et 20% aux encodeurs (stabilité).
- **Cas Dégradé (Buffer timeout)** : Si la lecture asynchrone des encodeurs accuse un retard de plus de **50 ms** (`ENCODER_BUFFER_MAX_AGE_MS`), `ALPHA = 0.0`. Le robot se fie alors à **100% au capteur optique**.

Le cap (Theta) dépend lui uniquement du BNO085 si disponible, sans quoi il se rabat sur l'intégration des encodeurs.

## 3. Contrôleur PID Amélioré

Le calcul d'erreur global alimente 3 contrôleurs PID indépendants (X, Y, Theta) implémentés dans `lib/pid/`.
Cette classe C++ sur-mesure intègre des sécurités indispensables pour la base holonome :

1. **Anti-Windup (Écrêtage de l'intégrale)** : Si les moteurs patinent ou sont bloqués, l'erreur intégrale va diverger. Le PID bloque dynamiquement l'accumulation de l'intégrale `_integral` entre les limites `minOutput / Ki` et `maxOutput / Ki`.

    ```cpp
    // robot1/teensy_moteur/lib/pid/src/pid.cpp
    void PID::setOutputLimits(double minOutput, double maxOutput) {
        if (minOutput >= maxOutput) return;
        _minOutput = minOutput;
        _maxOutput = maxOutput;
        // Clamp integral term to new limits (anti-windup)
        if (_ki != 0.0) {
            double iMin = _minOutput / _ki;
            double iMax = _maxOutput / _ki;
            _integral = constrain(_integral, iMin, iMax);
        }
    }
    ```

2. **Gestion adaptative du temps ($dt$)** : La boucle d'asservissement cible 100Hz ($dt = 10 \text{ ms}$). Si une perturbation du code retarde la boucle, le PID encadre drastiquement le paramètre temporel entre `1 ms` (`_dtMin`) et `20 ms` (`_dtMax`) pour empêcher les explosions mathématiques sur le calcul de la dérivée ($Kd / dt$).
3. **Deadband lissé (Correction du frottement statique)** : Les roues omnidirectionnelles souffrent d'un frottement sec élevé. Si le PID génère une commande très faible, le robot ne bouge pas. La classe inclut un `deadband` qui décale continuellement et de manière linéaire la sortie mathématique brute afin de garantir que toute commande mathématique non-nulle franchisse le seuil physique nécessaire pour faire démarrer les moteurs.
