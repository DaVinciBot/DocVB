---
id: branches
sidebar_label: Gestion des Branches
title: État et Résumé des Branches
description: Inventaire des branches Git du projet après le tri post-CDR d'août 2026.
slug: branches
sidebar_position: 5
tags: [cdr, nantes, git]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

Ce document dresse l'inventaire des branches Git après le **tri réalisé fin août 2026**.

:::info Tri effectué (29/08/2026)
La branche de travail de la CDR (`modification_durant_la_cdr_a_clean`) est devenue la nouvelle
`main`. Les branches obsolètes ont été supprimées après avoir été **sauvegardées sous forme de
tags** `archive/*` (poussés sur `origin`). Toute reprise part désormais de `main`.
:::

## Branche de référence

### `main`

- **Statut** :  Tronc unique — point de départ de toute reprise.
- **Contenu** : c'est l'ancienne `modification_durant_la_cdr_a_clean` (état à la fin de la CDR 2026).
  Contient : navigation haut niveau (pathfinding A*, stratégie, `robot.py`), module LiDAR complet
  (`lidar_detection.py` + `lidar_logic.py` avec recalage SVD), pont Rerun (`robot1/rasp/rerun/`),
  firmware Teensy avec migration du capteur optique vers Qwiic OTOS.
- **Point de vigilance** : `robot1/teensy_moteur/src/main.cpp` est un **firmware de TEST**
  (`test_logique_complete.cpp`). Le firmware de production (boucle USB + watchdog) est dans le tag
  `archive/precoupe-2026-05`. Le bas niveau sera **entièrement réécrit à partir de novembre 2026**
  (nouveau capteur d'odométrie + EKF + éventuelle séparation Teensy Moteur / Teensy Capteur).
- **Règle** : PR obligatoire, pas de push direct, tester (sim puis robot) avant merge.

## Branches conservées

### `features/camera_finir_implementation`

- **Statut** :  Incomplète, conservée.
- **Rôle** : vision par ordinateur (calibration + détection ArUco) sur la Raspberry Pi.
- **Limites connues** : `opencv-contrib-python` absent de `requirements.txt` (imports cassés) ;
  la navigation (`lidar/`, `strategy/`, `pathfinder.py`) a été supprimée sur cette branche ;
  `ArucoDetector` n'est pas intégré à la machine à états.
- **Recommandation** : reprise possible en 2027 — rebaser sur `main`, restaurer les dépendances,
  intégrer proprement. Voir [Détection Caméra](./features/camera.md).

### `feature/teensy_capteur`

- **Statut** :  Non mergeable en l'état, **conservée comme source d'inspiration**.
- **Rôle** : architecture à deux cartes (Teensy Moteur + Teensy Capteur dédiée aux capteurs),
  protocole série inter-Teensy (trames 14 o, UART 115200, 100 Hz).
- **Bugs connus** : seuil anti-bruit du flux optique hardcodé à 2 mm/cycle → odométrie aveugle
  sous ~0,2 m/s ; pas de CRC8 sur les trames inter-Teensy.
- **Recommandation** : ne pas merger. À réutiliser comme référence lors de la refonte firmware si
  la séparation en deux Teensy est retenue — en corrigeant le seuil (en counts bruts, pas en mm)
  et en ajoutant un CRC8. Voir [Teensy Capteur et EKF](./features/teensy-capteur.md).

### `old_main`

- **Statut** :  Archive (octobre 2025). Ne pas toucher.

## Branches supprimées (récupérables via tag)

| Ancienne branche | Devenue / remplacée par | Tag de sauvegarde |
| :--- | :--- | :--- |
| `modification_durant_la_cdr_a_clean` | **`main`** (swap `git branch -f`) | — |
| `precoupe_v2_voir_diff_modif_cdr` | rien — ne contenait plus d'unique que le `main.cpp` Teensy de production | `archive/precoupe-2026-05` (`a80a0ac`) |
| `feature/rerun.io_a_voir` | déjà absorbée dans `main` (0 commit unique, pont Rerun présent dans `robot1/rasp/rerun/`) | `archive/rerun-2026-04` |
| l'ancienne `main` (avril 2026) | remplacée par le swap ; contenait le prototype EKF `kalman/` | `archive/main-2026-04` (`a2d5fc9`) |

Pour retrouver le contenu d'un tag : `git switch --detach archive/<nom>` ou
`git show archive/<nom>:<chemin/fichier>`.

## Récapitulatif des sources pour la refonte firmware (novembre 2026)

| Besoin | Où regarder |
| :--- | :--- |
| Boucle USB, watchdog, timeout de mouvement dynamique | tag `archive/precoupe-2026-05` → `robot1/teensy_moteur/src/main.cpp` |
| Protocole inter-Teensy (à refaire avec CRC8) | branche `feature/teensy_capteur` |
| Prototype EKF 6D (à brancher sur de vrais capteurs) | tag `archive/main-2026-04` → `kalman/` |
| Cinématique inverse/directe + PID (éprouvés, à garder) | `main` → `robot1/teensy_moteur/lib/holonomic_basis/` |
