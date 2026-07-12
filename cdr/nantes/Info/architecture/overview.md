---
id: overview
title: Architecture Matérielle et Logicielle
description: Vue d'ensemble de l'architecture matérielle et logicielle du robot — topologie, répartition haut niveau / temps réel et flux de données.
slug: overview
sidebar_label: Vue d'Ensemble
sidebar_position: 1
tags: [cdr, nantes, robotique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

L'architecture du DaVinciBot est conçue pour séparer strictement l'intelligence de haut niveau (stratégie, évitement d'obstacles, vision) du contrôle temps réel (asservissement, lecture des encodeurs).

## 1. Topologie Matérielle

L'architecture s'articule autour des éléments suivants :

- **Raspberry Pi 5** : Ordinateur de bord principal. Exécute les scripts Python responsables de la machine à états de haut niveau, du calcul de trajectoire et de l'interface avec le Lidar.
- **Teensy 4.1 (Moteur)** : Microcontrôleur dédié à la base motrice. Il maintient une boucle de contrôle rapide (PID) et communique avec les drivers des moteurs.
- **MKS SERVO57D** : Moteurs pas-à-pas avec encodeurs intégrés (boucle fermée matérielle), pilotés via un bus RS485 par la Teensy Moteur. Le robot en utilise 3, disposés à 120° (base holonome holonome).
- **Capteurs de Télémétrie** :
  - **PAA5100JE** : Capteur de flux optique (SPI) pour l'odométrie sans glissement.
  - **BNO08x** : Centrale inertielle (IMU) en I2C pour un cap précis.
  - **RPLidar A2M8** : Lidar 360° connecté en USB à la Raspberry Pi. Dédié uniquement à la détection d'adversaires (via `lidar_detection`).

:::danger Doute signalé depuis `schema_info_v2.drawio`
Le fichier de conception abstrait `schema_info_v2.drawio` présente une carte supplémentaire dédiée : la **Teensy Capteur**. Sur ce schéma, les capteurs PAA5100JE et BNO085 sont reliés à cette carte, qui calcule et envoie les variations d'odométrie (`dx, dy, dtheta`) via UART vers la Teensy Moteur.
Or, dans le code actuel (post-CDR), cette architecture a été abandonnée par manque de temps. L'intégration de cette seconde Teensy avec un filtre de Kalman reste une **piste d'amélioration future** (cf. branche `feature/teensy_capteur`).
:::

## 2. Topologie Logicielle

Le code est divisé en deux mondes distincts qui communiquent via un protocole série sur-mesure (CRC8).

### 2.1. Côté Raspberry Pi (Haut Niveau)

L'arborescence racine (`robot1/rasp/`) contient le cœur décisionnel en Python :

- `main.py` et `robot.py` : Point d'entrée et objet global du robot, centralisant la gestion des sous-modules (mouvement, Lidar, terrain).
- `loader.py` : Utilitaire de chargement dynamique des classes de communication (permettant l'injection de dépendances pour la simulation).
- `switch_mode.py` : Script utilitaire pour basculer facilement l'environnement entre la simulation Webots et le matériel réel (modifie `config.json`).
- Modèles mathématiques de l'environnement (ex: `terrain_jeu.py`).

### 2.2. Côté Teensy Moteur (Bas Niveau)

Le dossier `robot1/teensy_moteur/` contient le firmware en C++ structuré sous PlatformIO :

- `src/main.cpp` : Boucle principale gérant la communication USB asynchrone et les interruptions de contrôle (IntervalTimer).
- `lib/holonomic_basis/` : Composant dédié au calcul matriciel de la cinématique holonomique inverse et directe (conversion des consignes de vitesse globales vers les 3 roues).
- `lib/MKSServo/` : Gestion du protocole série RS485 pour communiquer avec les MKS SERVO57D (lecture des encodeurs `read_encoders_nonblocking` et envoi des commandes de vitesse `send_movement_commands_nonblocking`).

## 3. Communication et Flux de Données

Le fonctionnement standard s'opère dans une boucle continue :

1. La **Raspberry Pi** détermine une position cible absolue `(X, Y, Theta)` et l'envoie à la Teensy via USB (commande `SET_TARGET_POSITION`).
2. La **Teensy Moteur** compare cette cible avec son odométrie via un PID (`lib/pid/`), applique la matrice holonomique, et diffuse les vitesses individuelles aux roues via le bus RS485.
3. À intervalles réguliers, la **Teensy Moteur** lit les capteurs, met à jour son odométrie absolue, et la renvoie par USB (`UPDATE_ROLLING_BASIS`) à la Raspberry Pi.

Pour visualiser ces flux sous forme de diagrammes Mermaid extraits du concepteur initial, consultez la page des [Schémas](./schemas.md).
