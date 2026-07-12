---
id: teensy-capteur
title: Architecture Capteurs et Filtre de Kalman (EKF)
sidebar_position: 3
---

:::info
Feature non implémentée — contexte d'origine résolu sur la Teensy Moteur. 
Pertinente uniquement si l'EKF devient prioritaire.
:::

## 1. Origine et Historique

Le développement d'une architecture à deux cartes (Teensy Moteur et Teensy Capteur) est né de problèmes électroniques rencontrés sur la carte principale, qui peinait à combiner de manière fiable le pilotage des moteurs et la lecture haute fréquence des capteurs (IMU, Optique).
Face à ces perturbations, la création d'une **Teensy Capteur** dédiée a été envisagée comme solution de secours pour isoler les bus de communication (I2C, SPI) des perturbations moteurs.

## 2. Résolution du Contexte d'Origine

Les problèmes électroniques rencontrés sur la Teensy Moteur ont par la suite été diagnostiqués et complètement résolus.
Par conséquent, la nécessité de séparer le matériel a disparu : tous les capteurs (BNO085, PAA5100) ont été rapatriés et refonctionnent de manière stable directement sur la Teensy Moteur principale.

## 3. Statut Actuel

Aujourd'hui, l'architecture à deux Teensy **n'est pas implémentée ni prête au déploiement**.
C'est une feature en suspens qui n'est plus une priorité immédiate, le besoin d'origine ayant été couvert.

## 4. Intérêt Futur : Le Filtre de Kalman (EKF)

Bien que la séparation matérielle ne soit plus nécessaire pour des raisons électroniques, elle reste une piste pertinente si l'on souhaite intégrer un véritable **Filtre de Kalman Étendu (EKF)**.
L'EKF nécessite des calculs matriciels lourds. Le déporter sur une carte dédiée (ou sur la Raspberry Pi) permettrait d'éviter de surcharger la boucle temps-réel (PID) de la Teensy Moteur, tout en offrant une meilleure fusion (LIDAR + IMU + Encodeurs) pour réduire la dérive (drift) lors des rotations.

---

## Annexe : Prototype EKF dans la branche `main`

Un prototype logiciel d'EKF a été rédigé dans la branche `main` (répertoire `kalman/`), mais reste inachevé et non activé.

### Implémentation Actuelle
L'algorithme se trouve dans les fichiers `ExtendedKalmanFilter.hpp` et `main (1).cpp`.
- **Vecteur d'état (6D)** : $x, y, \theta$ (position et orientation) ainsi que $v_x, v_y, \omega$ (vitesses).
- **Vecteur de mesure (5D)** : $x, y, \theta$ venant de la Teensy (odométrie classique) et la distance / angle issus du LIDAR.
- **Méthodes clés de la classe `ExtendedKalmanFilter`** :
  - `predict()` : Prédiction de l'état suivant via le modèle physique (holonome) du robot et les Jacobiennes.
  - `update()` : Mise à jour avec les mesures en utilisant la forme numériquement stable de Joseph.
  - `setupEKF()` : Configure les bruits de processus ($Q$) et de mesure ($R$).

### Ce qu'il manque
Actuellement, ce prototype n'est pas activé :
- Les capteurs appelés sont simulés (`readSensors()` renvoie des données fixes).
- Le code n'est branché ni au flux réel de la Raspberry Pi, ni à l'interruption de la Teensy.
