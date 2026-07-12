---
id: index
title: Projet DaVinciBot — Eurobot
sidebar_label: Accueil
sidebar_position: 1
---

# Documentation DaVinciBot (Coupe de France de Robotique)

Bienvenue sur la documentation technique du dépôt du DaVinciBot (Nantes - ESILV) pour la Coupe de France de Robotique.

Ce dépôt contient l'ensemble des codes (embarqué, haut niveau, simulation) développés pour notre robot holonome à 3 roues omnidirectionnelles. Notre objectif est l'autonomie totale sur le terrain pendant les matchs de 90 secondes.

## 🎯 Concept et Architecture

Le robot est structuré autour d'une architecture maître/esclave distribuée pour séparer la prise de décision de l'exécution temps réel :

- **Raspberry Pi (Python 3)** : Le "cerveau" du robot. Il prend les décisions stratégiques, lit les objectifs, et devrait centraliser l'analyse de l'environnement (ex: Lidar).
- **Microcontrôleurs Teensy 4.1 (C++ / PlatformIO)** : Le "muscle". Ils gèrent l'asservissement PID très haute fréquence, la cinématique holonomique, le pilotage des moteurs MKS SERVO57D et des actionneurs, ainsi que la lecture bas niveau de l'odométrie (encodeurs, capteurs optiques, IMU).

Les communications entre ces deux niveaux sont assurées par un protocole série propriétaire sécurisé par CRC8 et signatures.

### Matériel embarqué principal
- **Base** : Holonome 3 roues omnidirectionnelles (120° entre chaque roue)
- **Moteurs** : MKS SERVO57D pilotés via bus RS485
- **Capteurs** : PAA5100JE (flux optique), BNO08x (IMU), Lidar RPLidar A2M8 (expérimental)

## ⚠️ Contexte actuel et statut du code

La présente documentation est basée sur la version la plus récente du code (post-CDR).

warning : Avertissement sur l'implémentation Lidar / Navigation
Durant la Coupe, suite à des pressions temporelles, une tentative de contournement a été faite pour faire tourner certaines logiques (comme le traitement Lidar) de façon déportée ou simplifiée, sans passer pleinement par la Raspberry Pi. 
Cette solution temporaire n'a pas pu être testée en conditions réelles. L'architecture cible stipule que cette logique doit être gérée par la Raspberry Pi. Le code Lidar existant est donc à considérer comme **expérimental**.


## 📂 Navigation dans la documentation

Utilisez la barre latérale pour naviguer à travers les différentes sections :

1. **Architecture** : 
   - [Vue d'ensemble matérielle et logicielle](./architecture/overview.md)
   - [Schémas et flux de données](./architecture/schemas.md)
2. **Modules Core** :
   - [Protocole de communication USB](./modules/communication_usb.md)
   - [Pilotes moteurs MKS SERVO57D](./modules/mks_servo57d.md)
   - [Modèles de cinématique holonomique](./modules/cinematique.md)
   - [Odométrie, fusion de capteurs et PID](./modules/odometrie_pid.md)
   - [Navigation et stratégie globale](./modules/navigation_haut_niveau.md)
3. **Périphériques et Simulation** :
   - [Simulation Webots](./modules/simulation_webots.md)
4. **Composants Expérimentaux** :
   - [Détection Lidar](./modules/lidar_detection.md)
   - [Implémentation Caméra](./features/camera.md)
   - [Télémétrie avec Rerun.io](./features/rerun.md)
   - [Teensy Capteurs dédiés](./features/teensy-capteur.md)

---
*Documentation générée à partir du dépôt — Juin 2026*
