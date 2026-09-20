---
title: Débug et problèmes fréquents du calcul déporté
description: "Les pannes rencontrées sur la Jetson pendant la saison et comment les diagnostiquer : OpenCV sans CUDA, LoRa muet, précision de détection, écart PC/Jetson."
sidebar_label: Débug
sidebar_position: 3
tags: [cdr, paris, info, calcul-deporte, vision]
---

Ce document liste les problèmes rencontrés sur le **calcul déporté** (la Jetson), et comment les diagnostiquer ou les corriger. Il est fait pour être lu en panique au bord de la table : chaque fiche va du symptôme vers la solution.

## OpenCV peu performant sur la Jetson (pas de CUDA) {/* #opencv-cuda */}

- Symptômes : détection très lente, FPS faibles, GPU inutilisé alors qu'on est sur Jetson.
- Causes probables : OpenCV installé via pip **n'embarque pas CUDA** ; la lib tourne alors sur CPU.
- Comment vérifier : contrôler que le build OpenCV expose bien CUDA (dans le code, `_HAS_CUDA` est détecté à l'import du détecteur ; sinon le chemin CLAHE CUDA est désactivé). Vérifier `cv2.getBuildInformation()` (présence de CUDA + GStreamer).
- Solution ou contournement : **recompiler OpenCV localement avec CUDA + GStreamer**. Ne pas installer via pip. Recommandé : OpenCV ~4.5.1. La compilation est **très longue** sur Jetson, prévoir du temps.
- Fichiers/modules concernés : `src/detector/detector.py`.
- Remarques : c'est ce problème qui a motivé le passage de l'ancienne Jetson Nano à la **Jetson Nano Orin** (l'ancienne était trop lente même pour compiler).

## LoRa muet / port UART mal configuré {/* #lora-uart */}

- Symptômes : aucune donnée émise ou reçue sur le LoRa ; la connexion série échoue au démarrage.
- Causes probables : l'UART de la Jetson n'est pas configuré correctement (conflit avec la console série `nvgetty`, mauvais mapping des pins).
- Comment vérifier : contrôler l'ouverture de `/dev/ttyTHS1` à 115200 baud ; l'app sort en erreur (`sys.exit(1)`) si le LoRa est *unhealthy* à la connexion.
- Solution ou contournement : **configurer le module UART via `jetson-io`** (c'est ce qui a fini par débloquer la situation). Désactiver `nvgetty` sur le port. Vérifier le câblage (pins 8/10 vers UART1).
- Fichiers/modules concernés : `src/lora/lora.py`.
- Remarques : difficulté aggravée par une première expérience sur Jetson (peu de connaissances au départ) ; une fois la config UART comprise, c'est stable.

## Précision de détection insuffisante / compromis perf-qualité {/* #precision-detection */}

- Symptômes : positions un peu imprécises, détections qui sautent ou instables selon les réglages.
- Causes probables : qualité vidéo de la caméra limitée ; réglages OpenCV/ArUco difficiles à équilibrer entre vitesse et précision.
- Comment vérifier : comparer les positions détectées à la réalité sur la table ; activer le rendu 2D de l'arène (`SHOW_ARENA`) et le mode debug (`DEBUG_MODE`) pour visualiser.
- Solution ou contournement : ajuster les `DetectorParameters` ArUco et la calibration ; ne pas viser des FPS trop élevés (**~3 fps suffisent** pour alimenter la stratégie du robot) ; à terme, meilleure caméra et réécriture C++.
- Fichiers/modules concernés : `src/detector/detector.py`, calibration (`.env` / `calibration.npz`).
- Remarques : la détection n'est pas parfaite mais suffisante ; le lissage temporel (carry-forward) aide à stabiliser.

## Écart entre développement (PC) et production (Jetson) {/* #dev-vs-jetson */}

- Symptômes : du code qui marche sur ordinateur mais se comporte différemment sur la Jetson.
- Causes probables : différences d'environnement (OpenCV/CUDA, GStreamer, pilotes caméra, UART) entre le PC de dev et la Jetson de prod.
- Comment vérifier : tester directement sur la Jetson, en conditions réelles.
- Solution ou contournement : prévoir des tests **en présentiel sur la Jetson** ; utiliser les modes factices pour dérisquer une partie du dev à distance : `DUMMY_DETECTION` (monde simulé), `DUMMY_LORA` (affiche les paquets au lieu de les envoyer).
- Fichiers/modules concernés : `main.py` (toggles `DUMMY_DETECTION`, `DUMMY_LORA`, `USE_CV2_IMSHOW`, `STREAM_HOST`).
- Remarques : plus une contrainte de workflow qu'un bug ; la boucle d'itération est parfois lente car il faut être sur place pour tester en conditions réelles.

## `cv2.imshow` qui échoue à l'affichage {/* #cv2-imshow */}

- Symptômes : aucune fenêtre ne s'ouvre, erreur d'affichage OpenCV.
- Causes probables : OpenCV compilé **sans support GTK/Qt** sur cette Jetson.
- Comment vérifier : tenter un `imshow` simple ; observer l'absence de fenêtre ou l'erreur.
- Solution ou contournement : utiliser les **sinks GStreamer** via `make_display_writer()` (nv3dsink/xvimagesink) au lieu de `cv2.imshow` ; pour du headless/SSH, activer le **stream UDP H.264** (`STREAM_HOST`/`STREAM_PORT`). `ensure_x_session()` (`xhost +`, `XAUTHORITY`) aide quand root doit accéder au display X.
- Fichiers/modules concernés : `src/utils/display.py`, `main.py`.
- Remarques : aucune.
