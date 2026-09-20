---
title: Débug et problèmes fréquents des PAMIs
description: "Les pannes rencontrées sur les PAMIs pendant la saison et comment les diagnostiquer : microstepping, flash ESP32, tirette, LoRa bloquant, logs série."
sidebar_label: Débug
sidebar_position: 3
tags: [cdr, paris, info, pami, esp32]
---

Ce document liste les problèmes rencontrés sur les **PAMIs** (petits robots autonomes sur ESP32-S3, firmware PlatformIO dans `PAMI/`) et comment les diagnostiquer ou les corriger. Rappel : il existe deux PAMIs — « Normal » (`PAMI_ID 1`) et « Ninja » (`PAMI_ID 2`) — qui partagent le même code, différencié **à la compilation** par `PAMI/include/config.h`.

## Distances et rotations fausses d'un facteur constant (MICROSTEPPING_FACTOR) {/* #microstepping */}

- Symptômes : le PAMI avance systématiquement trop loin ou pas assez, tourne trop ou pas assez, toujours dans les mêmes proportions (×2, ×4, ÷2…). Les trajectoires sont reproductibles mais fausses.
- Causes probables : le `MICROSTEPPING_FACTOR` de `config.h` ne correspond pas au microstepping réellement configuré sur les drivers des moteurs pas-à-pas (jumpers/switchs côté élec). Le nombre de pas par tour (`STEPS_PER_REV = 400 × facteur`) est alors faux, et toute l'odométrie avec. Attention : les deux PAMIs n'ont pas le même facteur (8 pour Normal, 4 pour Ninja) — copier la config de l'un sur l'autre reproduit le bug.
- Comment vérifier : demander un déplacement simple et connu (ex. `moveForwardStepsBlocking` de 400 steps) et mesurer la distance réelle parcourue. Comparer avec la valeur attendue (ex. 400 steps = 100 mm). Vérifier le câblage des jumpers/switchs sur les drivers et le `MICROSTEPPING_FACTOR` dans `config.h`.
- Solution ou contournement : aligner `MICROSTEPPING_FACTOR` dans `config.h` avec la configuration physique des drivers (vérifier avec l'élec), recompiler, reflasher. Ne jamais régler le problème en trafiquant `WHEEL_DIAMETER_MM`.
- Fichiers/modules concernés : `PAMI/include/config.h` (`MICROSTEPPING_FACTOR`, `_STEPS_PER_REV`), `PAMI/lib/motor/`, `PAMI/lib/rolling_basis/`.
- Remarques : problème réellement vécu cette année. Toute intervention élec sur les drivers doit déclencher une re-vérification de ce paramètre.

## Impossible de flasher l'ESP32 : le port est occupé {/* #flash-port-occupe */}

- Symptômes : `pio run -t upload` échoue (port introuvable, timeout, « port busy »), alors que la carte est bien branchée et fonctionnait à l'instant.
- Causes probables : un **moniteur série est resté ouvert** (PlatformIO monitor, `read_serial.py`, autre terminal) et occupe le port USB — l'outil de flash ne peut pas le prendre. Erreur vécue plusieurs fois cette année.
- Comment vérifier : chercher un terminal/monitor ouvert sur la machine ; l'erreur d'upload mentionne généralement le port occupé ou ne liste plus le port.
- Solution ou contournement : fermer tous les moniteurs série avant de flasher (y compris `read_serial.py`), puis relancer l'upload. En dernier recours, débrancher/rebrancher la carte.
- Fichiers/modules concernés : `PAMI/platformio.ini`, `PAMI/read_serial.py`.
- Remarques : réflexe à automatiser : « je flashe → je ferme le monitor d'abord ». Les deux opérations ne peuvent pas coexister sur le même port.

## Le firmware flashé « disparaît » : flash non persistant {/* #flash-non-persistant */}

- Symptômes : le PAMI fonctionne juste après le flash, mais après une coupure d'alimentation il repart sur un ancien comportement ou ne démarre plus — comme si le flash n'avait jamais eu lieu.
- Causes probables : problème **électronique** (alimentation de la carte, mémoire flash défectueuse, carte endommagée) — ce n'est pas un bug logiciel.
- Comment vérifier : reflasher, vérifier le fonctionnement, couper/remettre l'alimentation et observer si le comportement persiste ; comparer avec une autre carte saine.
- Solution ou contournement : **aller voir l'élec immédiatement, ne pas attendre** ni chercher côté code — leçon de cette année : du temps a été perdu à soupçonner le logiciel. Remplacer la carte si nécessaire.
- Fichiers/modules concernés : aucun côté code — matériel (ESP32-S3 Seeed XIAO, alimentation).
- Remarques : symptôme piégeux parce qu'il ressemble à un bug de code. Si le comportement observé ne correspond pas au code flashé, suspecter le matériel tôt.

## ESP32 grillée : courts-circuits sur le dos de la carte {/* #esp32-grillee */}

- Symptômes : carte morte — plus détectée en USB, plus d'alimentation, parfois odeur/échauffement.
- Causes probables : court-circuit des soudures/pins exposées au dos de la carte avec un objet conducteur posé sur le plan de travail — cette année : **une règle en métal**.
- Comment vérifier : la carte n'apparaît plus dans les périphériques USB d'aucune machine, même avec un autre câble.
- Solution ou contournement : remplacer la carte (et reporter `PAMI_ID`, `COLOR_INVERSION` et le bon `MICROSTEPPING_FACTOR` dans la config avant de flasher la remplaçante). **Prévention : scotcher/isoler le dos de chaque carte** dès son montage, et bannir les objets métalliques de la zone de test.
- Fichiers/modules concernés : matériel uniquement.
- Remarques : une carte grillée en fin d'année = du temps de re-câblage et de re-configuration au pire moment. L'isolation du dos coûte 30 secondes.

## Mauvaise stratégie ou mauvaise couleur au départ (config compilée) {/* #config-compilee */}

- Symptômes : le PAMI exécute la trajectoire de l'autre PAMI, ou part en miroir du bon côté de la table (mauvaise couleur d'équipe).
- Causes probables : tout est figé **à la compilation** dans `config.h` : `PAMI_ID` (1 = Normal, 2 = Ninja) choisit la stratégie, `COLOR_INVERSION` force la couleur (0 = lecture de la tirette couleur, 1 = jaune forcé, -1 = bleu forcé). Un flash avec la mauvaise valeur — ou un `COLOR_INVERSION` forcé oublié après un test — donne un robot qui « marche » mais joue le mauvais match.
- Comment vérifier : au démarrage, les logs série (`DEBUG_PRINTF`) affichent la couleur retenue ; relire `config.h` du binaire flashé (le `#define` en tête de fichier).
- Solution ou contournement : vérifier `PAMI_ID` et `COLOR_INVERSION` avant **chaque** flash ; remettre `COLOR_INVERSION 0` (lecture tirette couleur, pins 14/15) après tout test en couleur forcée ; étiqueter physiquement chaque PAMI avec son ID.
- Fichiers/modules concernés : `PAMI/include/config.h`, `PAMI/src/main.cpp` (sélection de la stratégie et lecture couleur dans `setup()`).
- Remarques : c'est le prix de la config à la compilation. À terme, lire l'ID depuis le matériel (strap GPIO) éviterait la classe entière de bugs.

## Le PAMI ne part pas : séquence tirette {/* #tirette */}

- Symptômes : tirette retirée mais le PAMI reste immobile ; ou il semble ne jamais « armer ».
- Causes probables : la séquence de `setup()` est strictement bloquante : attendre la tirette **branchée** (pin 41 HIGH), puis attendre son **retrait** (pin LOW), puis la stratégie démarre. Une tirette jamais branchée, un faux contact, ou un branchement après la mise sous tension dans le mauvais ordre bloque l'attente. À cela s'ajoute le `Wait(85000)` du PAMI Normal : il est normal qu'il ne bouge pas pendant les 85 premières secondes du match.
- Comment vérifier : brancher le câble USB et lire les logs série (`-- DEMARRAGE ---`, `Attente tirette...`, `Tirette connectee...`, `Tirette retiree, GO!`) pour voir à quelle étape la séquence est bloquée ; utiliser `read_serial.py`.
- Solution ou contournement : respecter l'ordre : alimenter le PAMI → brancher la tirette → attendre → retirer au top départ. Vérifier le câblage de la pin 41 (INPUT_PULLDOWN : un fil coupé = jamais HIGH) si les logs restent sur « Attente tirette ».
- Fichiers/modules concernés : `PAMI/src/main.cpp` (`setup()`), `PAMI/include/config.h` (`TIRETTE_PIN`).
- Remarques : ne pas confondre « bloqué à la tirette » et « attente des 85 s » — les logs série lèvent l'ambiguïté en quelques secondes.

## Le PAMI reste figé au démarrage avec le LoRa activé {/* #lora-bloque */}

- Symptômes : avec `ENABLE_LORA true`, le PAMI s'arme (tirette OK) puis ne fait plus rien.
- Causes probables : le `setup()` attend **indéfiniment** l'attribution d'un ID par le « Calcul Déporté » (`while (myPamiId == -1)`) : si le module LoRa n'est pas câblé, pas alimenté, ou que le Calcul Déporté ne répond pas, le PAMI est bloqué sans timeout ni message d'erreur au-delà des logs.
- Comment vérifier : logs série — si la dernière ligne est « LoRa: demande d'ID au Calcul Deporte... », c'est ce blocage.
- Solution ou contournement : pour un match sans Calcul Déporté, compiler avec `ENABLE_LORA false` (stratégie fixe embarquée — c'est la configuration jouée à la coupe). Pour utiliser le LoRa, s'assurer que le Calcul Déporté tourne avant de retirer la tirette. Ajouter un timeout de repli serait une amélioration simple.
- Fichiers/modules concernés : `PAMI/src/main.cpp` (bloc `ENABLE_LORA`), `PAMI/lib/com_pami/`, `PAMI/include/config.h` (pins et bauds LoRa).
- Remarques : la liaison LoRa (attribution d'ID et de point de dépôt) est **fonctionnelle mais n'a pas été utilisée en compétition** — la coupe s'est jouée en stratégie fixe codée en dur.

## Debug série : pas de logs ou logs illisibles {/* #debug-serie */}

- Symptômes : rien ne s'affiche sur le moniteur série, ou les premières lignes du démarrage manquent.
- Causes probables : `ENABLE_DEBUG false` compile tous les `DEBUG_*` en no-op ; ou le moniteur a été ouvert après le `delay(2000)` du démarrage (les premières lignes sont perdues) ; ou mauvais baudrate (115200).
- Comment vérifier : contrôler `ENABLE_DEBUG` dans `config.h` et le baudrate du moniteur.
- Solution ou contournement : garder `ENABLE_DEBUG true` en développement ; utiliser `PAMI/read_serial.py` pour capturer les logs ; ouvrir le moniteur avant de presser reset pour avoir le démarrage complet. Penser à fermer le moniteur avant de flasher (voir fiche dédiée).
- Fichiers/modules concernés : `PAMI/include/config.h` (`ENABLE_DEBUG`), `PAMI/read_serial.py`.
- Remarques : l'OTA WiFi (`ENABLE_OTA`) existe pour flasher sans câble mais a été peu utilisée en pratique — le flash USB reste la voie normale.
