---
id: rerun
title: Visualisation 3D avec Rerun.io
sidebar_position: 4
---

:::info Feature à l'étude (Branche `feature/rerun.io_a_voir`)
Cette fonctionnalité d'intégration de **Rerun.io** pour le monitoring 3D et le débogage temps réel a été prototypée mais n'est pas mergée sur `main`. Son impact sur les ressources CPU de la Raspberry Pi doit encore être évalué en conditions de match.
:::

## 1. Contexte et Motivation

Pour comprendre les décisions de l'algorithme de Pathfinding et l'odométrie du robot en temps réel, un outil de visualisation 3D est indispensable. 

Historiquement, le projet utilisait **Foxglove**, mais l'équipe a décidé de prototyper l'utilisation de **Rerun.io** pour remplacer ce dernier. Rerun offre une interface web plus moderne, une timeline interactive fluide, et un replay historique ("source of truth") extrêmement performant.

## 2. Modes de Déploiement

Le script principal de pont (`rerun_bridge.py`) supporte trois modes d'exécution adaptés aux différentes phases de développement :

### Mode 1 : Simulation Locale (Développement sur PC)
Ce mode permet de tester la visualisation sans le matériel physique.
```bash
cd robot1/rasp/
python rerun/rerun_bridge.py --mode local --sim
```
*Le viewer Rerun s'ouvre directement avec des données fictives.*

### Mode 2 : Serveur Web (Raspberry Pi vers PC distant)
C'est le mode recommandé en compétition. La Raspberry Pi fait tourner le pont Rerun en tâche de fond et expose l'interface 3D sur le réseau local via WebSocket, avec zéro latence.
```bash
python rerun/rerun_bridge.py --mode serve --host 0.0.0.0 --port 9876
```
Depuis un PC distant connecté au même réseau, il suffit d'ouvrir un navigateur (Chrome, Firefox) : `http://<IP_RASPBERRY>:9876`.

### Mode 3 : Avec Matériel (Teensy + Lidar)
Le mode serveur peut scruter directement les capteurs physiques pour un monitoring réel :
```bash
python rerun/rerun_bridge.py --mode serve --with-lidar --port 9876
```

## 3. Interface et Outils de Débogage

L'interface de Rerun est structurée en plusieurs panneaux configurés automatiquement par le pont logiciel :

- **Panneau 3D (Haut)** : 
  - Affiche le terrain de jeu texturé et les obstacles statiques.
  - 🔵 **Robot Bleu** : Représente l'odométrie brute issue de la Teensy.
  - 🔴 **Robot Rouge** : Représente la position calculée par trilatération Lidar.
  - 🟢 **Robot Vert** : Représente la position finale fusionnée (ex: 60% Lidar + 40% Teensy).
  - 🟨 **Point Jaune** : Cible du Pathfinding.
  - 📍 **Nuage de points Lidar** affiché en temps réel.

- **Panneau Temporel (Bas)** : 
  - Courbes d'évolution pour déboguer le PID et la dérive.
  - Écart (en mm) entre l'odométrie et le LIDAR (`data/fusion/ecart_odom_lidar_mm`).
  - Indice de confiance de la trilatération Lidar (`data/lidar/confidence`).

- **Timeline (Gauche)** : 
  - Permet de faire des retours dans le passé (Replay) pour analyser pourquoi le robot a pris une certaine décision à un instant $T$.

## 4. Bilan et Recommandations (Pour / Contre)

L'intégration de Rerun a démontré de grandes capacités, mais la décision finale de merge reste en suspens.

**Pour :**
- Excellent outil de débogage visuel, paramétrable depuis du code Python natif.
- Fluidité de la Timeline temporelle pour analyser les "crashs" et les erreurs d'odométrie post-mortem.
- Accès distant très stable en WiFi, indispensable quand le robot est sur la table.

**Contre :**
- L'outil a un coût d'encodage et de transmission des données (surtout pour le nuage de points Lidar à haute fréquence) qui pourrait solliciter dangereusement le CPU de la Raspberry Pi 5.

**Recommandation pour l'année prochaine :**
Mener un test de charge CPU (Stress Test) en conditions réelles avec le Pathfinding actif. Si la boucle principale de 20 Hz arrive à maintenir sa cadence sans ralentissement, cette branche devra absolument être mergée.
