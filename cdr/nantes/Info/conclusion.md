---
id: conclusion
title: Conclusion et Perspectives
sidebar_position: 99
---

# Conclusion et Perspectives

Cette année a permis d'établir une fondation technique extrêmement solide pour le DaVinciBot. 
Le travail acharné de l'équipe a donné naissance à une base roulante holonome très fiable : la communication USB CRC8 asynchrone, les boucles de régulation PID de la Teensy Moteur et la fusion de données odométriques fonctionnent de manière robuste. 

Cependant, par manque de temps de test en conditions réelles, de nombreuses fonctionnalités haut-niveau (Pathfinding A*, vision par ordinateur, filtrage de Kalman avancé) sont restées à l'état expérimental et n'ont pas pu exprimer leur plein potentiel durant la compétition.

Voici donc la feuille de route recommandée pour l'équipe qui reprendra le flambeau l'année prochaine.

## Objectifs pour l'année prochaine

### 1. Interface Homme Machine (IHM)
Il est critique de développer une interface de supervision en temps réel. Lors des matchs ou du débogage sur table, l'équipe doit pouvoir monitorer instantanément l'état du robot, sa position calculée, la vision de ses capteurs (LIDAR, Optique) et l'étape de la stratégie en cours d'exécution.

### 2. Finaliser le Filtre de Kalman et la Teensy Capteur
L'EKF (Filtre de Kalman Étendu) est partiellement implémenté de manière théorique dans la branche `main`. L'objectif est de le compléter et potentiellement de valider son exécution sur une **Teensy Capteur** dédiée. Cela permettrait de délester la boucle temps-réel des moteurs et d'exploiter à 100% l'IMU et le flux optique pour éliminer totalement la dérive d'odométrie.

### 3. Implémentation de la Caméra
La branche `features/camera_finir_implementation` contient les prémices du pipeline de vision (calibration et détection ArUco). L'objectif est de finaliser la détection des objets à déplacer sur la table, d'affiner le calcul de distance, et surtout de l'intégrer nativement dans la machine à états de la stratégie pour des actions conditionnelles.

### 4. Optimisation Globale du Code
Un grand nettoyage s'impose. Il faudra finaliser l'intégration de la branche `modification_durant_la_cdr_a_clean` dans `main`. Il est également nécessaire de supprimer les vestiges de code mort (comme le recalage Lidar par SVD ou `lidar_logic.py`) afin de clarifier le dépôt. Enfin, une refactorisation du `StratManager` s'impose pour permettre de configurer la stratégie via un fichier externe (JSON/YAML) sans avoir à recompiler ou modifier le code source Python entre les matchs.

### 5. Optimisation du LIDAR
Le Pathfinder (`A*`) n'a pas été prouvé en match. Il faudra le tester en conditions réelles avec le robot en mouvement. L'algorithme de clustering du **RPLidar A2M8** doit être affiné pour gérer la disparition des adversaires. L'évaluation de l'outil `rerun.io` (actuellement dans `feature/rerun.io_a_voir`) est fortement recommandée pour se doter d'un outil de debug visuel 3D performant.

### 6. Réalisation des Actionneurs
L'ancienne base de code d'actionneurs héritée doit être remplacée. Il appartiendra à l'équipe mécanique de concevoir les nouveaux actionneurs pour manipuler les éléments de la prochaine thématique Eurobot, et à l'équipe logicielle d'implémenter leurs commandes asynchrones depuis la Teensy dédiée.

### 7. Réalisation du PAMI
Le règlement Eurobot requiert la mise en place d'un robot secondaire (PAMI). La prochaine équipe devra concevoir ce robot, définir son architecture (probablement plus simple que le DaVinciBot) et assurer sa synchronisation ou son indépendance vis-à-vis du robot principal.

---

## 📝 Note à la nouvelle équipe

Si vous reprenez ce projet, bienvenue ! Vous héritez d'une base technique puissante. 
**Pour bien commencer :**
- Familiarisez-vous avec la simulation Webots (`switch_mode.py simulation`) pour tester votre code Python sans risquer de casser la mécanique.
- Lisez impérativement `communication_usb.md` et `odometrie_pid.md` pour comprendre comment le "cerveau" et le "corps" du robot se parlent.
- **Attention au piège classique** : Ne modifiez pas la boucle PID ou la lecture des encodeurs sans vérifier les temps d'exécution. Sur la Teensy Moteur, chaque microseconde compte !

Bon courage pour cette nouvelle saison !
