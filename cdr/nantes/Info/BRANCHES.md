---
id: branches
title: Gestion des Branches
sidebar_position: 5
---

# État et Résumé des Branches

Ce document dresse un inventaire des branches Git actives du projet et de leur statut.

## 1. `modification_durant_la_cdr_a_clean`

- **Statut** : ⚡ La plus récente
- **Rôle** : Modifications et correctifs rapides effectués durant la Coupe de France de Robotique (CDR). Cette branche contient des ajustements vitaux (IHM, logique LIDAR, configuration des capteurs).
- **Différences avec `main`** : Ajouts massifs de code (GUI LIDAR, nouveaux dossiers de test capteurs `capteur_optique_cali`, etc.), corrections dans la navigation et suppression de code obsolète.
- **Recommandation** : **À nettoyer et à merger**. Extraire les correctifs propres et les intégrer à `main` de manière structurée.

## 2. `precoupe_v2_voir_diff_modif_cdr`

- **Statut** : ⚡ Récente
- **Rôle** : Version de la base de code figée juste avant ou pendant la pré-coupe, utilisée comme référence de base pour les modifications de la CDR.
- **Différences avec `modification_durant_la_cdr_a_clean`** : La branche CDR contient de nombreux ajouts (plus de 2500 insertions) par rapport à celle-ci, notamment sur les outils Python (LIDAR, tests) et la Teensy.
- **Recommandation** : **À archiver**. Conserver uniquement comme point de restauration historique de la pré-coupe.

## 3. `main`

- **Statut** : ✅ Stable
- **Rôle** : Branche principale et stable du robot. Elle contient la logique nominale (déplacement holonome, stratégie de base, odométrie).
- **Recommandation** : **Continuer** de l'utiliser comme référence pour la production.

## 4. `features/camera_finir_implementation`

- **Statut** : 🚧 Incomplète
- **Rôle** : Implémentation de la vision par ordinateur (computer vision) via la Raspberry Pi (fichiers `cam/camera.py`, `vision_manager.py`).
- **Différences avec `main`** : Ajoute des dossiers et scripts liés à la détection via caméra.
- **Recommandation** : **Continuer**.
- **TODOs** :
  - Terminer l'intégration avec la logique de match.
  - Tester les performances sur le matériel cible.

## 5. `feature/rerun.io_a_voir`

- **Statut** : 🔍 À évaluer
- **Rôle** : Intégration de l'outil `rerun.io` pour la visualisation 3D en temps réel des données du robot (LIDAR, position, carte).
- **Différences avec `main`** : Ajout de scripts `rerun_bridge.py`, export de carte, configuration d'environnement virtuel avec Rerun.
- **Décision pour/contre** :
  - *Pour* : Excellent outil de débogage visuel, très utile pour calibrer l'évitement et comprendre les décisions du robot.
  - *Contre* : Impact potentiel sur les ressources CPU de la Raspberry.
- **Recommandation** : **À évaluer**. Tester sur table pour mesurer l'impact CPU avant de merger.

## 6. `feature/teensy_capteur`

- **Statut** : ❓ Incertain
- **Rôle** : Séparation de l'architecture matérielle avec l'introduction d'une seconde carte Teensy dédiée aux capteurs (LIDAR, IMU, flux optique).
- **Différences avec `main`** : Ajout du dossier `robot1/teensy_capteur`, mise en place du protocole série (UART 115200 bps), et refactorisation de la `teensy_moteur` pour accepter les deltas d'odométrie.
- **Recommandation** : **À archiver**. L'architecture matérielle à deux cartes est devenue inutile suite à la résolution des problèmes électroniques sur la Teensy Moteur principale (voir `teensy-capteur.md`).
