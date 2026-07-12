---
id: cinematique
title: Cinématique Holonome (3 Roues) et Asservissement
description: Conversion entre le référentiel monde et le référentiel des roues pour la base holonome à 3 roues — cinématique inverse, cinématique directe et asservissement PID.
slug: cinematique
sidebar_label: Cinématique et Odométrie
tags: [cdr, nantes, robotique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

Ce module, implémenté dans `lib/holonomic_basis/`, gère la conversion entre le référentiel global du robot (Monde) et le référentiel matériel des roues (Moteurs). Il repose sur une Base holonome à 3 roues disposées à 120°.

## 1. Configuration Physique de la Base

L'orientation des moteurs dans le repère local du robot est la suivante :

- **Roue 1 (Avant-Droite)** : Orientée à 120°
- **Roue 2 (Avant-Gauche)** : Orientée à 240°
- **Roue 3 (Arrière)** : Orientée à 0° (axe horizontal)

```text
             Y+ (avant)
              ^
              |
    [W2 240°] | [W1 120°]
              |
    X- ───────+──────── X+
              |
          [W3 0°]
              |
             Y- (arrière)
```

| Roue | Position physique | Angle cinématique | STEP | DIR | EN  |
| ---- | ----------------- | ----------------- | ---- | --- | --- |
| W1   | Haut Droite       | 120°              | 2    | 3   | 4   |
| W2   | Haut Gauche       | 240°              | 5    | 6   | 7   |
| W3   | Arrière           | 0°                | 8    | 9   | 10  |

Parametre physique du robot dans config.h

| Paramètre                       | Valeur          |
| ------------------------------- | --------------- |
| Rayon robot (centre → axe roue) | 156.9 mm        |
| Diamètre roue effectif          | 60.0 mm         |
| Steps/révolution (NEMA 23)      | 200             |
| Microstepping                   | 32              |
| Steps totaux/tour               | 6 400           |
| Vitesse max                     | 20 000 steps/s  |
| Accélération max                | 10 000 steps/s² |

## 2. Cinématique Inverse (Calcul des Consignes Moteurs)

La cinématique inverse transforme les consignes globales de vitesse cible du robot ($V_x$, $V_y$, $\Omega$) en consignes de rotation individuelles pour chaque roue ($W_1$, $W_2$, $W_3$).

Dans la fonction `Holonomic_Basis::handle`, le système commence par convertir la vitesse cible du repère Monde au repère Robot :

$$
V_{x,\text{robot}} = \cos(\theta) \cdot V_{x,\text{world}} + \sin(\theta) \cdot V_{y,\text{world}}
$$
$$
V_{y,\text{robot}} = -\sin(\theta) \cdot V_{x,\text{world}} + \cos(\theta) \cdot V_{y,\text{world}}
$$

Ensuite, ces vitesses sont converties en RPM et distribuées aux roues selon la matrice suivante issue du code :

$$
W_1 = -0.5 \cdot V_{x,\text{rpm}} + 0.866 \cdot V_{y,\text{rpm}} - \Omega_{\text{rpm}}
$$
$$
W_2 = -0.5 \cdot V_{x,\text{rpm}} - 0.866 \cdot V_{y,\text{rpm}} - \Omega_{\text{rpm}}
$$
$$
W_3 = 1.0 \cdot V_{x,\text{rpm}} + 0.0 \cdot V_{y,\text{rpm}} - \Omega_{\text{rpm}}
$$

*Note : $0.866$ correspond à $\sin(120°)$ et $-0.5$ correspond à $\cos(120°)$.*

> `robot1/teensy_moteur/lib/holonomic_basis/src/holonomic_basis.cpp`

```cpp
      //Equation de mouvements
      // Roue 1 avec axe à 120° : cos(120°) = -0.5, sin(120°) = +0.866
      double w1 = -0.5*vx_rpm + 0.866*vy_rpm - omega_rpm;
      double w2 = -0.5*vx_rpm - 0.866*vy_rpm - omega_rpm;
      double w3 = +1.0*vx_rpm + 0.0*vy_rpm   - omega_rpm;
  ```

### Filtrage et Lissage

Afin de ne pas endommager la mécanique par des à-coups, les vitesses calculées traversent un filtre passe-bas avant d'être envoyées aux moteurs :
$$ W_{\text{filtered}} = \alpha \cdot W_{\text{new}} + (1 - \alpha) \cdot W_{\text{filtered}} $$
Le coefficient $\alpha$ (`speed_filter_alpha`) est fixé à `0.3` par défaut.

> `robot1/teensy_moteur/lib/holonomic_basis/src/holonomic_basis.cpp`

```cpp
      // Application du filtre passe-bas pour lisser les changements de vitesse
      // Formule : filtered = alpha * new_value + (1 - alpha) * old_value
      filtered_wheel1_rpm = speed_filter_alpha * last_wheel1_rpm + (1.0 - speed_filter_alpha) * filtered_wheel1_rpm;
      filtered_wheel2_rpm = speed_filter_alpha * last_wheel2_rpm + (1.0 - speed_filter_alpha) * filtered_wheel2_rpm;
      filtered_wheel3_rpm = speed_filter_alpha * last_wheel3_rpm + (1.0 - speed_filter_alpha) * filtered_wheel3_rpm;
  ```

Une redimension proportionnelle (normalisation) est appliquée après le filtrage pour s'assurer que la vitesse maximale configurée (`MAX_SPEED_RPM`) n'est jamais dépassée.

## 3. Cinématique Directe (Calcul de l'Odométrie)

La cinématique directe réalise l'opération inverse : elle part des distances parcourues par chaque roue (remontées par les encodeurs via le bus RS485) pour en déduire le déplacement du robot dans le repère local.

L'inversion mathématique de la matrice précédente donne le système suivant implémenté dans `update_odometry()` :

$$
dx_{\text{enc}} = \frac{-W_1 - W_2 + 2.0 \cdot W_3}{3.0}
$$
$$
dy_{\text{enc}} = \frac{W_1 - W_2}{\sqrt{3.0}}
$$
$$
\Omega_{\text{enc}} = \frac{-(W_1 + W_2 + W_3)}{3.0 \cdot \text{robot\_radius}}
$$

Ces deltas de mouvement local sont ensuite basculés dans le référentiel absolu (Monde) pour mettre à jour la position `(X, Y, THETA)` :
$$ X = X + dx_{\text{enc}} \cdot \cos(\theta) - dy_{\text{enc}} \cdot \sin(\theta) $$
$$ Y = Y + dx_{\text{enc}} \cdot \sin(\theta) + dy_{\text{enc}} \cdot \cos(\theta) $$

## 4. Asservissement PID

Le positionnement est assuré par 3 contrôleurs PID indépendants (X, Y, et Theta).

- Les erreurs sont calculées directement dans le référentiel Monde (différence entre la position actuelle issue de l'odométrie et la consigne).
- Les sorties des PIDs alimentent directement les vitesses $V_{x,\text{world}}$, $V_{y,\text{world}}$ et $\Omega$.
- **Zone morte** : Pour éviter l'instabilité (tremblements) à l'arrêt, le code force les consignes à zéro dès que l'erreur de distance est inférieure à `10 mm` et l'erreur angulaire inférieure à `0.15 rad` (~1.15°). La gestion du frottement sec (Deadband) est gérée plus bas dans la classe PID (voir le module [Odométrie et PID](odometrie_pid.md)).
