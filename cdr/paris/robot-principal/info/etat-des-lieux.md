---
title: État des lieux du robot principal
description: "État des lieux du robot principal — non rédigé : le brouillon livré était un doublon du fichier de débug."
sidebar_label: État des lieux
sidebar_position: 2
tags: [cdr, paris, info, robot-principal, robotique]
---

État des lieux du robot principal à l'issue de la Coupe de France de Robotique 2026 (Winter is Coming). À lire avec la documentation principale (architecture) et la documentation débug (diagnostic des problèmes).

## Ce qui fonctionne {/* #fonctionne */}

- **Toute la chaîne de démarrage et d'orchestration** : `main.py` → serveur WebSocket → `MainBrain` → séquence de match (choix équipe/mode via la WebUI, tirette branchée, init PID/odométrie, tirette retirée, arrêt à 100 s). Utilisée telle quelle en compétition.
- **La communication Rasp↔Teensy** (`common/usb_com/`) : le protocole série partagé Python/C++ est fiable, avec reconnexion gérée (`BaseComTeensy`). Aucune désynchronisation en compétition.
- **La base roulante sur Teensy** : moteurs, encodeurs, 4 boucles PID et odométrie fonctionnent ; le robot s'est déplacé en match (voir les réserves de précision plus bas).
- **Le framework de stratégie en graphe** (`common/strategy/` + `GraphRunner`) : c'est lui qui a fait tourner la stratégie jouée en compétition. Les sous-graphes et transitions conditionnelles fonctionnent.
- **Le code d'évitement (ACS)** : validé fonctionnel — c'est le matériel qui a lâché en compétition, pas le logiciel (voir plus bas).
- **La simulation par dummies** (base roulante temps réel, actionneurs, lidar) avec visualisation matplotlib de l'arène : outil de développement principal de l'année, fiable.
- **Le secours ultrason** : le capteur ultrason (`sensors/ultrasonic/`), prévu comme solution de repli, a réellement servi — il a remplacé au pied levé le lidar mort pendant la coupe.
- **Les outils de debug** : `debug_lidar.py`, `debug_gpio_inputs.py`, `debug_recorder` de la base roulante, réglage PID via la WebUI.

## Ce qui fonctionne partiellement {/* #partiel */}

- **La précision des déplacements** : les déplacements sont corrects mais **imprécis** — dérive et écarts gênants pour les actions fines. Cause principale identifiée : les PID ont été réglés sans la masse définitive du robot (assemblage tardif), et les réglages n'ont jamais pu être stabilisés en conditions réelles. C'est le chantier prioritaire de la roadmap (« exactitude des déplacements »).
- **L'évitement en conditions réelles** : le code ACS fonctionne, mais la **connectique entre la Rasp et le lidar** a lâché en compétition (lidar mort). L'évitement a dû être assuré en urgence par l'ultrason, beaucoup plus rudimentaire. Le maillon faible est matériel (câblage/connectique), pas logiciel.
- **Les stratégies riches** (`tower_rush`, `tower_rush_alt`…) : écrites, testées en simulation, mais **jamais jouées en match** — elles dépendaient d'actionneurs qui n'étaient pas prêts. Seule la stratégie simple `go_backstage` a tourné en compétition.

## Ce qui ne fonctionne pas encore {/* #pas-encore */}

- **Le code des actionneurs pour les actions de jeu 2026** (retourner les Jengas, déposer en zone de dépôt) : l'électronique des actionneurs est arrivée **pendant la coupe** — il n'y a pas eu le temps de développer ni de valider les séquences sur le vrai matériel. Le firmware `teensy_actuator` et le pilote `ActuatorsShow` existent, mais les actions de jeu n'ont jamais été jouées en match. C'est exactement le scénario que la roadmap veut empêcher de se reproduire (tout le reste doit être nickel avant l'arrivée de la méca/élec).
- **Un match complet de bout en bout** : la chaîne stratégie riche + actionneurs + évitement lidar n'a jamais été validée ensemble, ni en test ni en compétition.
- **La migration du logging** : le passage à `loggerplusplus` a laissé des références à l'ancien `log_manager` commentées dans plusieurs modules ; la migration n'est pas terminée.

## Ce qui a été tenté mais abandonné {/* #abandonne */}

- **L'asservissement en vitesse** : tenté mais non validé en conditions réelles.
