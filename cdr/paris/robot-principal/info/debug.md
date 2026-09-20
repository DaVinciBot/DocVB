---
title: Débug et problèmes fréquents du robot principal
description: "Les pannes rencontrées sur le robot principal et comment les diagnostiquer : dummies, ports Teensy, protocole désynchronisé, multi-process, PID, odométrie, évitement."
sidebar_label: Débug
sidebar_position: 3
tags: [cdr, paris, info, robot-principal, robotique]
---

Ce document liste les problèmes rencontrés sur le **robot principal**, et comment les diagnostiquer ou les corriger. Il est fait pour être lu en panique au bord de la table : chaque fiche va du symptôme vers la solution.

## Le robot « ne fait rien » : dummies activés {/* #dummies */}

- Symptômes : le code tourne sans erreur, la stratégie s'exécute (logs normaux, visualisation matplotlib cohérente), mais le robot réel ne bouge pas / les actionneurs restent inertes.
- Causes probables : les flags de simulation de `.env` pointent sur les versions **dummy** (`ROLLING_BASIS_DUMMY`, `ACTUATORS_DUMMY`, `LIDAR_DUMMY`) au lieu du vrai matériel — typiquement après une session de dev sur un seul point du matériel.
- Comment vérifier : ouvrir `.env` et contrôler les flags d'activation des dummies ; au lancement, les loggers indiquent quelle classe a été instanciée pour chaque contrôleur.
- Solution ou contournement : désactiver les dummies dans `.env` et relancer.
- Fichiers/modules concernés : `.env`, `robot1/rasp/main.py` (sélection des implémentations), `controllers/rolling_basis/rolling_basis_dummy.py`, `controllers/actuators/actuators_dummy.py`, `sensors/lidar/lidar_dummy.py`.
- Remarques : c'est le premier réflexe à avoir quand « rien ne marche mais rien ne plante ».

## Teensy non détectée ou mauvais port série {/* #teensy-port */}

- Symptômes : erreur à l'initialisation de `RollingBasis` ou `ActuatorsShow`, port série introuvable, ou la mauvaise carte répond (les deux Teensy sont identiques vues de l'USB).
- Causes probables : câble/hub USB défectueux ; Teensy pas flashée ou plantée ; identification incorrecte — les deux Teensy 4.1 partagent le même VID/PID (5824/1155) et ne se distinguent que par leur **numéro de série** défini dans `config.json` : une carte remplacée = un numéro de série à mettre à jour.
- Comment vérifier : sur la Rasp, `lsusb` et `ls /dev/ttyACM*` pour voir les cartes présentes ; comparer les numéros de série détectés avec ceux de `config.json` ; les logs d'init de `Com` indiquent le port retenu.
- Solution ou contournement : mettre à jour le numéro de série dans `config.json` après tout remplacement de carte ; rebrancher/redémarrer la Teensy (la couche `BaseComTeensy` gère reset et reconnexion) ; reflasher le firmware PlatformIO si la carte ne répond plus du tout.
- Fichiers/modules concernés : `config.json` (VID/PID/serials), `common/usb_com/python/com/com.py`, `common/teensy/` (`BaseComTeensy`), firmwares `robot1/teensy_moteur/` et `robot1/teensy_actuator/`.
- Remarques : étiqueter physiquement les deux Teensy (« moteur » / « actuator ») avec leur numéro de série évite de déboguer à l'aveugle.

## Messages Rasp↔Teensy incompris (protocole désynchronisé) {/* #protocole-desync */}

- Symptômes : NACK répétés, commandes ignorées par la Teensy, valeurs aberrantes dans les retours d'odométrie, comportements incohérents juste après une modification du protocole.
- Causes probables : le protocole `usb_com` a été modifié côté Python mais le **firmware n'a pas été recompilé/reflashé** (ou inversement) ; les liens symboliques qui partagent le code C++ de `common/usb_com/cpp/` dans les deux firmwares sont cassés (attention aux checkouts sous Windows : les symlinks peuvent devenir des fichiers texte).
- Comment vérifier : comparer les IDs de messages entre `common/usb_com/python/messages.py` et le code C++ inclus dans les firmwares ; vérifier que `common/usb_com/cpp/` est bien résolu dans les `platformio.ini` des deux firmwares ; regarder les messages `PRINT`/`NACK` remontés par la Teensy dans les logs.
- Solution ou contournement : toute modification du protocole = recompiler et reflasher **les deux** firmwares dans la foulée ; sous Windows, activer `git config core.symlinks true` ou travailler le firmware depuis la Rasp/Linux.
- Fichiers/modules concernés : `common/usb_com/` (python + cpp), `robot1/teensy_moteur/platformio.ini`, `robot1/teensy_actuator/platformio.ini`.
- Remarques : le partage du code C++ par symlink est justement là pour rendre cette désynchronisation impossible *à condition* de reflasher. Le maillon faible est humain, pas technique.

## État partagé multi-process qui ne se propage pas / crash pyserial {/* #multiprocess */}

- Symptômes : une valeur mise à jour dans une tâche (position, statut, consigne UI) n'est jamais vue par la boucle `run()` (ou l'inverse) ; ou exceptions étranges de sérialisation/pickling au démarrage d'une tâche ; ou plantage dès qu'un objet contrôleur est touché depuis le mauvais processus.
- Causes probables : la boucle `run()` tourne dans un **processus séparé** (contrainte `taskbrain`). Deux règles absolues : (1) les objets qui possèdent un port série (`RollingBasis`, `ActuatorsShow`) doivent être **créés dans le processus qui les utilise** — les handles pyserial ne se partagent pas ; (2) tout état partagé passe par `DictProxyAccessor`, et chaque type transporté doit être **enregistré comme sérialisable** dans `main.py`. Un type non enregistré ou un accès direct inter-processus viole silencieusement ces règles.
- Comment vérifier : identifier dans quel processus vit l'objet concerné (les contrôleurs sont créés *dans* `run()`, pas dans `main.py`) ; vérifier que le type échangé figure dans la liste des types enregistrés de `main.py` ; logger la valeur des deux côtés pour voir où elle se perd.
- Solution ou contournement : enregistrer le type manquant dans `main.py` ; ne jamais passer un contrôleur d'un processus à l'autre — passer des données, pas des objets à handle.
- Fichiers/modules concernés : `robot1/rasp/main.py` (enregistrement des types), `robot1/rasp/brains/main_brain.py` (`run()` et les autres tâches), lib `taskbrain`.
- Remarques : c'est le piège n°1 du projet pour un nouveau membre. En cas de doute, relire la section « multi-process » de la documentation principale.

## Une tâche du brain ne boucle pas (métaprogrammation taskbrain) {/* #taskbrain-loop */}

- Symptômes : une tâche censée tourner en continu ne s'exécute qu'une fois, ou du code placé « avant la boucle » s'exécute à chaque itération.
- Causes probables : `taskbrain` transforme le corps d'une méthode en boucle à partir du marqueur `# --- MetaProg is insane (loop) --- #` : tout ce qui est au-dessus est de l'init exécutée une fois, tout ce qui est en dessous devient le corps de la boucle. Marqueur absent, mal orthographié ou mal placé = comportement inattendu, sans erreur.
- Comment vérifier : chercher le marqueur dans la méthode concernée de `main_brain.py` et vérifier sa position ; comparer avec une tâche qui fonctionne (`run()` par exemple).
- Solution ou contournement : replacer le marqueur exactement, et copier la structure d'une tâche existante plutôt que d'écrire une tâche de zéro.
- Fichiers/modules concernés : `robot1/rasp/brains/main_brain.py`, lib `taskbrain`.
- Remarques : mécanisme puissant mais opaque — identifié dans la documentation principale comme dette à documenter/simplifier.

## PID instables : oscillations, dépassements, comportement changé {/* #pid-instables */}

- Symptômes : le robot oscille autour de sa consigne, dépasse ses points d'arrivée, tremble à l'arrêt, ou un réglage qui marchait ne marche plus.
- Causes probables : gains PID inadaptés à la **masse actuelle** du robot. Erreur vécue cette année : les PID ont été réglés sur un châssis sans le poids définitif (actionneurs, batterie…) — l'inertie finale a tout invalidé. Toute modification mécanique significative (masse, roues, centre de gravité) invalide le réglage.
- Comment vérifier : utiliser le `debug_recorder` de la base roulante pour enregistrer consigne vs réponse et visualiser le comportement, plutôt que de juger à l'œil ; la WebUI permet d'envoyer des consignes PID de test.
- Solution ou contournement : suivre le protocole du tutoriel `documentations/tuto_reglage_pids_rolling_basis.md` (les 4 boucles : gauche/droite puis linéaire/angulaire) ; ne considérer un réglage comme définitif que sur le robot **en configuration de match**.
- Fichiers/modules concernés : `config.json` (gains), `controllers/rolling_basis/pids.py`, `controllers/rolling_basis/debug_recorder.py`, firmware `robot1/teensy_moteur/` (lib pid), WebUI (réglage en live).
- Remarques : chronophage par nature — c'est la raison pour laquelle la roadmap demande une base roulante à la masse cible tôt dans l'année.

## Odométrie qui dérive : le robot se croit ailleurs {/* #odometrie-derive */}

- Symptômes : après quelques déplacements, la position estimée ne correspond plus à la position réelle ; les trajectoires visent des points décalés ; l'arène (et donc l'évitement) raisonne sur une position fausse.
- Causes probables : glissement des roues (accélérations trop fortes, obstacle heurté, tapis de la table) ; paramètres d'odométrie (entraxe, diamètre de roues) imprécis ; odométrie non réinitialisée à la bonne position de départ ; dérive cumulative normale sans recalage ; roues encodeuses sales, mal fixées ou que la résolution configurée sur le matériel est fausse.
- Comment vérifier : test répétable — faire faire au robot un aller-retour ou un carré et mesurer l'écart physique à l'arrivée ; comparer la position remontée (`UPDATE_ROLLING_BASIS`) avec la position réelle mesurée au mètre ; à l'arrêt sans pid, déplacer le robot manuellement et voir où il est sur la visualisation.
- Solution ou contournement : vérifier que `run()` a bien réinitialisé l'odométrie à la position de départ de l'équipe (elle est refaite entre « tirette branchée » et « tirette retirée ») ; recalibrer entraxe/diamètre dans la config du firmware ; adoucir les profils de vitesse (`config.json`) si les roues patinent ; prévoir des recalages en match (contact bordure) pour les actions de précision.
- Fichiers/modules concernés : firmware `robot1/teensy_moteur/` (odométrie), `controllers/rolling_basis/`, `robot1/rasp/brains/main_brain.py` (séquence d'init), `config.json` (positions de départ par équipe, profils de vitesse).
- Remarques : une odométrie fiable est le prérequis de tout le reste (navigation, évitement, actionneurs) — d'où la priorité « exactitude des déplacements » de la roadmap.

## Robot immobilisé par l'évitement (ACS) alors que la voie est libre {/* #acs-bloque */}

- Symptômes : le robot s'arrête ou refuse d'avancer sans adversaire devant lui ; ou au contraire il évite trop tard.
- Causes probables : faux obstacles vus par le lidar (éléments de décor, bordures, poussière sur la vitre du SICK TiM) ; profil ACS trop conservateur pour ce type de déplacement ; position du robot fausse (voir fiche odométrie : l'arène projette le scan lidar depuis la position estimée) ; buffers d'obstacle trop grands dans l'arène.
- Comment vérifier : lancer `robot1/rasp/debug_lidar.py` pour voir le scan brut ; activer la visualisation matplotlib de l'arène pour voir les obstacles projetés et la zone ennemie ; identifier quel profil ACS (`none` / `no_projection` / `rectangular_projection` / `angular_restrict_projection`) est appliqué au déplacement en cause dans `config.json`.
- Solution ou contournement : nettoyer/repositionner le lidar ; ajuster le profil ACS du type de déplacement concerné dans `config.json` ; corriger d'abord l'odométrie si la position est fausse ; en dernier recours pour un déplacement court et maîtrisé, utiliser un profil sans projection.
- Fichiers/modules concernés : `sensors/lidar/`, `common/navigation/avoidance/`, `common/arena/` (projection des obstacles), `config.json` (profils ACS par type de déplacement), `robot1/rasp/debug_lidar.py`.
- Remarques : un robot qui s'arrête à tort perd le match aussi sûrement qu'une collision — les profils ACS méritent d'être validés en simulation avec un adversaire simulé.

## Le match ne démarre pas : tirette / BAU {/* #tirette-bau */}

- Symptômes : tirette retirée mais le robot ne part pas ; ou le robot part avant le retrait ; ou tout s'arrête sans raison apparente (BAU).
- Causes probables : câblage/faux contact sur la tirette (GPIO pin 17) ou le bouton d'arrêt d'urgence (pin 16) ; séquence non respectée côté opérateur — `run()` attend **d'abord la tirette branchée**, réinitialise alors PID et odométrie, **puis** attend le retrait ; brancher/débrancher dans le désordre bloque l'attente ; la WebUI n'a pas encore fourni mode et couleur, donc `start()` n'a jamais lancé `run()`.
- Comment vérifier : lancer `robot1/rasp/debug_gpio_inputs.py` pour lire l'état brut de la tirette et du BAU ; vérifier dans les logs à quelle étape la séquence de départ est bloquée (attente équipe ? attente branchement ? attente retrait ?).
- Solution ou contournement : respecter la checklist de départ : WebUI connectée → mode + couleur choisis → tirette branchée → attendre la confirmation d'init → retrait de la tirette ; contrôler le câblage GPIO si les états lus sont incohérents.
- Fichiers/modules concernés : `sensors/inputs/inputs.py`, `robot1/rasp/brains/main_brain.py` (`start()`, `wait_jack_plug()`, `wait_jack_trigger()`), `robot1/rasp/debug_gpio_inputs.py`.
- Remarques : transformer cette séquence en checklist papier affichée sur le robot — en compétition, personne ne relit le code.

## WebUI inaccessible : impossible de configurer le robot {/* #webui */}

- Symptômes : l'écran/la tablette n'affiche rien ou ne se connecte pas ; impossible de choisir équipe et mode, donc le robot ne démarrera jamais (voir fiche précédente).
- Causes probables : serveur WebSocket pas encore lancé ou planté au démarrage (une exception dans `main.py` avant `ws_server.run()` empêche tout) ; mauvais port/adresse (port 8080, routes `/cmd` et `/ui`) ; Chromium non lancé (l'option `i` de `main.py` ne s'ouvre que si demandée) ; problème réseau entre la tablette et la Rasp.
- Comment vérifier : regarder les logs de `main.py` au démarrage (le serveur logge ses connexions) ; depuis la Rasp, vérifier que le port 8080 écoute ; tester l'URL de la WebUI depuis un navigateur sur le même réseau.
- Solution ou contournement : relancer `start.sh` et lire la première exception dans les logs ; vérifier `config.json` (ports) ; lancer avec `i` pour l'affichage local.
- Fichiers/modules concernés : `robot1/rasp/main.py`, `robot1/rasp/WebUI/`, lib `wscomms`, `config.json` (ports).
- Remarques : sans WebUI il existe peu de plan B pour configurer le match — c'est un point de fragilité connu de l'architecture.
