---
title: Modules principaux du calcul déporté
description: "Fiches des packages de jetson/src : orchestrateur main.py, capture CSI, détection ArUco, géométrie de l'arène, cycle de match, transport LoRa et utilitaires."
sidebar_label: Modules
sidebar_position: 1
tags: [cdr, paris, info, calcul-deporte, vision]
---

Vue d'ensemble des packages sous `jetson/src/`. Chaque module suit la même fiche. L'orchestrateur `jetson/main.py` relie tout le reste (config `.env`, boucle principale, envoi LoRa).

## `main.py` (orchestrateur) {/* #main-py */}

- Rôle du module : point d'entrée unique de l'application. Charge la config, choisit le mode (calibration ou détection), instancie tous les composants et fait tourner la boucle temps réel (~15 fps).
- Pourquoi il existe : centraliser le démarrage, la config et le pipeline complet en un seul endroit.
- Entrées : fichier `.env` (via `python-dotenv`), images de `CSICamera`, messages LoRa entrants (cmd 1 = demande d'ID, cmd 4 = départ de match), touches clavier (injection manuelle de commandes).
- Sorties : messages LoRa sortants (cmd 2 = ID, cmd 3 = assignations de dépôt, cmd 5 = vision), flux vidéo/arène optionnels.
- Modules ou composants avec lesquels il communique : tous les autres modules (`camera`, `detector`, `arena`, `game`, `lora`, `utils`).
- État actuel : fonctionnel. Fonctions clés : `detect_aruco()` (pipeline principal), `calibrate_camera()`, `build_lora_message()` (paquet vision « rasp-compatible »), `compute_speed()`, `find_zone_for_kapla()` / `group_kapla_by_zone()`, `start_keyboard_thread()`.
- Limites connues : fichier volumineux (~750 lignes) qui concentre config, boucle et logique métier ; gestion des threads perfectible.
- Points à améliorer : découper en modules plus fins ; reprendre proprement le threading lors du passage en C++.

## src/camera/ : CSICamera {/* #camera */}

- Rôle du module : capturer le flux de la caméra CSI IMX219 et fournir des images prêtes à analyser (undistortion incluse).
- Pourquoi il existe : exploiter le pipeline GStreamer accéléré matériellement (nvargus) de la Jetson pour capturer sans saturer le CPU.
- Entrées : capteur IMX219 (via `nvarguscamerasrc`, `sensor-mode=0`), matrices de calibration.
- Sorties : images (BGR ou GRAY8 selon le mode), cartes d'undistortion précalculées.
- Modules ou composants avec lesquels il communique : `main.py` (fournit les images), `detector` (indirectement).
- État actuel : fonctionnel. Capture threadée à **1920×1080 @ 15 fps**, drop de frame automatique (le thread garde toujours la dernière image, d'où une latence faible et pas de file d'attente). Calibration/distorsion via un **plateau d'échecs scanné sous différents angles** pour collecter les données. Méthodes clés : `read_frame()`, `init_undistort_maps()`, `undistort_frame()`, `calibrate()`, `get_stats()`, `release()`.
- Limites connues : qualité vidéo de la caméra améliorable ; résolution/FPS figés dans le pipeline.
- Points à améliorer : caméra de meilleure qualité ; rendre la résolution/FPS plus configurables.

## src/detector/ : ArucoDetector (cœur du système) {/* #detector */}

- Rôle du module : détecter les marqueurs ArUco, projeter leur position dans le repère réel de l'arène (mètres) + calculer leur orientation (yaw), et produire le rendu 2D de l'arène.
- Pourquoi il existe : c'est le cerveau du calcul déporté, il transforme une image en état de jeu exploitable.
- Entrées : images de `CSICamera`, calibration caméra, `arena_elements` (géométrie), IDs des marqueurs de référence.
- Sorties : `detected_world = [(marker_id, position_m, yaw), ...]` ; rendu vidéo 2D de l'arène (via GStreamer).
- Modules ou composants avec lesquels il communique : `camera` (images), `arena` (zones/refs), `main.py` (consomme les détections).
- État actuel : fonctionne très bien. `DICT_4X4_100`, homographie `findHomography(RANSAC)` (≥4 refs) ou `getAffineTransform` (3 refs) avec **cache temporel** des refs occultées, projection **batch**, lissage temporel (**carry-forward** des marqueurs statiques), fallback **multi-échelle** (plusieurs résolutions pour ne rater aucun ArUco), CLAHE (variante CUDA si dispo). Sensibilité de détection volontairement **très permissive**, compensée par un **warm-up** (2 hits / 3 frames) qui filtre les faux positifs (kaplas et références exemptés car leurs codes appartiennent à un petit ensemble connu). Fonctions clés : `analyze_frame()`, `compute_transform_from_refs()`, `transform_points_to_world_batch()`, `_apply_warmup_filter()`, `update_arena_display()`.
- Limites connues : précision limitée par la qualité de la caméra ; compromis perf / qualité de détection non trivial ; configuration OpenCV délicate à régler.
- Points à améliorer : réécriture C++ avec les dernières versions d'OpenCV pour de meilleures perfs ; on n'a pas besoin de 15 fps, ~3 fps suffiraient déjà à alimenter la stratégie du robot.

## src/arena/ : arena_elements {/* #arena */}

- Rôle du module : décrire la géométrie de l'arène : zones de départ, de dépôt et de ramassage (position, dimensions, couleur, `id_zone`).
- Pourquoi il existe : fournir une référence commune pour situer les éléments détectés dans les bonnes zones et pour assigner les PAMIs.
- Entrées : aucune (données statiques codées en dur avec numpy).
- Sorties : dictionnaire `arena_elements` (`starting_zone`, `zone_depot`, `zone_ramassage`).
- Modules ou composants avec lesquels il communique : `main.py` (zonage des kaplas), `game` (assignation des dépôts), `detector` (rendu).
- État actuel : fonctionnel et stable.
- Limites connues : valeurs en dur, à re-vérifier/mettre à jour à chaque changement de règlement/table.
- Points à améliorer : externaliser la géométrie dans un fichier de config si les tables changent souvent.

## src/game/ : MatchState {/* #game */}

- Rôle du module : gérer le cycle de vie du match et la coordination des PAMIs.
- Pourquoi il existe : centraliser l'état temporel du match (démarrage, durée, phases) et décider des assignations de zones. La coordination des PAMIs est confiée à la Jetson car elle est allumée **bien avant** le match (identification stable, contrairement au robot qui peut redémarrer pendant la préparation).
- Entrées : signal de départ de match (cmd 4, couleur `B`/`Y`), enregistrement des PAMIs (cmd 1), `arena_elements`.
- Sorties : état du match (`elapsed`, `is_over`, `should_send_pre_end`), assignations de dépôt (message cmd 3).
- Modules ou composants avec lesquels il communique : `main.py` (piloté par la boucle), `lora` (émission cmd 3), `arena` (zones).
- État actuel : fonctionnel, thread-safe. Constantes : `MATCH_DURATION=100 s`, `PRE_END_OFFSET=10 s`. Méthodes clés : `start_match()`, `register_pami()`, `compute_depot_assignments()`, `build_msg_3()`.
- Limites connues : logique d'assignation simple (répartition des zones de dépôt aux PAMIs enregistrés).
- Points à améliorer : stratégie d'assignation plus élaborée si un canal bidirectionnel temps réel est mis en place.

## src/lora/ : LoRa {/* #lora */}

- Rôle du module : transport radio bidirectionnel (UART) vers le module DX LR01 pour échanger avec le robot et les PAMIs.
- Pourquoi il existe : canal de communication robuste et peu saturé à la Coupe (contrairement au WiFi).
- Entrées : messages à envoyer (`queue_send`), octets reçus sur le port série.
- Sorties : trames `cmd|arg|arg` émises sur `/dev/ttyTHS1` ; dispatch des messages entrants vers des handlers.
- Modules ou composants avec lesquels il communique : `main.py` (handlers cmd 1/4, envoi cmd 2/3/5), `game` (cmd 3).
- État actuel : fonctionnel. UART 115200 baud, threads `_send_loop` (file « dernier gagne », pacing selon le baudrate, passage en *unhealthy* après N erreurs TX) et `_recv_loop` (bufferisation + split sur les fins de ligne). Méthodes clés : `connect()`, `start()`, `queue_send()`, `register_handler()`, `stop()`.
- Limites connues : faible débit, on ne peut envoyer que le minimum de données ; sensible à la config UART de la Jetson (voir Débug).
- Points à améliorer : remplacer par une techno plus moderne et bidirectionnelle temps réel (voir Roadmap).

## src/utils/ : display & timing {/* #utils */}

- Rôle du module : utilitaires transverses d'affichage et de mesure de temps.
- Pourquoi il existe : `cv2.imshow` échoue sur cette Jetson (OpenCV compilé sans GTK/Qt), il faut donc passer par des sinks GStreamer ; et on veut pouvoir profiler le code.
- Entrées : images à afficher, paramètres de résolution/FPS ; flag de debug.
- Sorties : `cv2.VideoWriter` GStreamer (affichage local ou stream), timings par fonction.
- Modules ou composants avec lesquels il communique : `main.py`, `detector` (writers d'affichage).
- État actuel : fonctionnel. Fonctions clés : `make_display_writer()`, `ensure_x_session()`, `set_debug_mode()`, décorateur `@timer`.
- Limites connues : dépend fortement de la configuration GStreamer/X de la machine.
- Points à améliorer : remplacer l'affichage local par un dashboard web (voir Roadmap).
