---
id: mks-servo57d
title: Pilotes Moteurs MKS SERVO57D
description: Interface RS485 des contrôleurs moteurs MKS SERVO57D — protocole, modes d'arrêt et synchronisation de groupe.
slug: mks-servo57d
sidebar_label: Moteurs MKS SERVO57D
tags: [cdr, nantes, robotique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

La base roulante du DaVinciBot est propulsée par trois moteurs pas-à-pas équipés de contrôleurs intégrés **MKS SERVO57D** (boucle fermée matérielle).
La communication entre la Teensy Moteur et ces contrôleurs s'effectue via un bus **RS485** asynchrone bidirectionnel.

Le code d'interface se trouve dans `robot1/teensy_moteur/lib/MKSServo/`.
La documentation la plus complète en termes de code : [MKS SERVO42&57D RS485 User Manual V1.0.9 (PDF)](https://github.com/makerbase-motor/MKS-SERVO42D-57D/blob/master/User%20Manual/V1.0.9/MKS%20SERVO42%2657D_RS485%20User%20Manual%20V1.0.9.pdf)

## 1. Protocole RS485 MKS

Le protocole série imposé par les MKS SERVO57D repose sur une structure de trame avec un en-tête strict et une somme de contrôle simple (somme des octets).

### Format de la trame

|          `Head` (1 octet)           |      `Addr` (1 octet)       |        `Cmd` (1 octet)        |      `Payload` (N octets)       |       `CRC` (1 octet)       |
| :---------------------------------: | :-------------------------: | :---------------------------: | :-----------------------------: | :-------------------------: |
| `0xFA` (Envoi) / `0xFB` (Réception) | Adresse du moteur (1, 2, 3) | Commande (ex: `0xF6`, `0x31`) | Données (vitesse, accélération) | Somme des octets modulo 256 |

### Commandes supportées et implémentées

La classe `MKSServo` gère les commandes suivantes :

- **Activation / Désactivation (`0xF3`)** : Commande `enable()` (payload `0x01`) et `disable()` (payload `0x00`).
- **Contrôle de vitesse (`0xF6`)** : Commande `setSpeed(rpm, acc)`. Le payload contient la direction (bit 7), la vitesse sur 15 bits, et l'accélération (0 à 255).

  {/*robot1/teensy_moteur/lib/MKSServo/mks_servo.cpp*/}

  ```cpp
  bool MKSServo::setSpeed(double rpm, uint8_t acc) {
      const bool ccw       = rpm < 0.0;
      const uint16_t speed = static_cast<uint16_t>(fabs(rpm));

      // Format F6 : [dir(7)|speed_high(3..0)] [speed_low] [acc 0-255]
      uint8_t payload[3];
      payload[0] = static_cast<uint8_t>((ccw ? 0x80 : 0x00) | ((speed >> 8) & 0x0F));
      payload[1] = static_cast<uint8_t>(speed & 0xFF);
      payload[2] = acc;

      return sendPacket(0xF6, payload, sizeof(payload));
  }
  ```

- **Lecture de l'encodeur (`0x31`)** : Requête de la position absolue de l'encodeur. Le moteur répond avec une valeur sur 48 bits, que le code C++ étend et convertit en `int64_t`.
- **Calibration (`0x80`)** : Commande bloquante avec timeout (jusqu'à 15s) attendant une confirmation de succès (`1`) ou d'échec (`2`).

:::tip Optimisation de la file d'attente (Fire & Forget)
Pour les commandes de contrôle (`0xF3` et `0xF6`), le code n'attend volontairement pas la réponse du moteur. En effet, au niveau matériel, la réponse UART des moteurs a été désactivée (`UartRSP=Disable`) pour éviter d'engorger le bus RS485 et de ralentir la boucle d'asservissement de la Teensy. Ces fonctions retournent immédiatement après l'envoi (`serial.write`).
:::

## 2. Modes d'Arrêt (Sécurité et Mécanique)

La classe `MKSServo` distingue deux méthodes d'arrêt pour préserver la mécanique :

- **`stop()`** : Envoie une consigne de vitesse nulle avec une accélération douce (`acc=5`). Cela produit une rampe de décélération qui évite les à-coups violents et le patinage.
- **`emergencyStop()`** : Envoie une consigne de vitesse nulle avec une accélération immédiate (`acc=0`). L'arrêt est brutal ; réservé aux collisions ou à la désactivation d'urgence.

## 3. Gestion de Groupe et Synchronisation (`MKSGroup`)

Puisque la base est holonome (3 roues), il est crucial que les moteurs reçoivent leurs consignes et renvoient leurs encodeurs de manière la plus simultanée possible. La classe `MKSGroup` englobe les 3 instances `MKSServo` pour gérer ces aspects.

### Normalisation des vitesses

Si la cinématique calcule une vitesse de roue dépassant la capacité maximale (`MAX_SPEED_RPM`), la méthode `MKSGroup::normalize` réduit proportionnellement les vitesses des trois roues. Cela garantit que le robot conserve sa trajectoire et son angle de déplacement, même si la vitesse globale est saturée. (Voir le [module Cinématique](cinematique.md) pour le détail des matrices de conversion).

### Lecture asynchrone en rafale (Optimisation Critique)

La lecture des 3 encodeurs est l'opération la plus lente de la boucle d'asservissement, car elle requiert un échange bidirectionnel (envoi de la requête `0x31`, attente de la réponse de 9 octets, traitement).

Initialement, une approche séquentielle prenait beaucoup de temps :

1. *Demande Roue 1* ➔ *Attente Réponse Roue 1*
2. *Demande Roue 2* ➔ *Attente Réponse Roue 2*
3. *Demande Roue 3* ➔ *Attente Réponse Roue 3*

La méthode **`readAllEncodersSynced()`** implémente une lecture asynchrone pipelinée :

1. La Teensy envoie les requêtes `0x31` aux 3 moteurs en rafale immédiate (décalage de ~0.3ms seulement).
2. Les 3 moteurs calculent et répondent en parallèle.
3. La Teensy lit les 3 réponses avec un timeout.

  {/*robot1/teensy_moteur/lib/MKSServo/mks_group.cpp*/}

  ```cpp
  bool MKSGroup::readAllEncodersSynced(int64_t& enc1, int64_t& enc2, int64_t& enc3) {
      enc1 = enc2 = enc3 = 0;

      // Phase 1 : Envoyer 3 requêtes 0x31 en rafale (~0.3ms de décalage)
      bool send_ok = true;
      if (wheel1) send_ok = wheel1->sendReadRequest() && send_ok;
      if (wheel2) send_ok = wheel2->sendReadRequest() && send_ok;
      if (wheel3) send_ok = wheel3->sendReadRequest() && send_ok;
      // ...
  ```

Cette parallélisation du temps de réponse matériel permet un gain pratique de l'ordre de **30 à 40 ms** par boucle de contrôle, assurant la viabilité du PID temps réel.
