---
id: conclusion
title: Conclusion et Perspectives
sidebar_position: 99
---

# Conclusion et Perspectives

Cette année a permis d'établir une fondation technique solide en Info pour la CDR-Nantes.

Nous avons pu valider pas mal de choses : communication entre les composants, des bases pour tout le bas niveau (Teensy) mais aussi pour le haut niveau.

Cependant, par manque de temps de test en conditions réelles, de nombreuses fonctionnalités haut niveau (pathfinding A*, vision par ordinateur) sont restées à l'état expérimental et n'ont pas pu exprimer leur plein potentiel durant la compétition.

Cette année, vous n'allez pas partir d'une page blanche, ce qui, j'espère, d'un côté vous rassure, mais ce n'est pas pour autant qu'il n'y aura pas de taff.

Voici donc la feuille de route recommandée pour l'équipe qui reprendra le flambeau l'année prochaine.

## Objectifs pour l'année prochaine

### 1. Interface Homme Machine (IHM)

Nous pouvons développer une interface de supervision en temps réel. Cela permettrera a l'équipe de pouvoir monitorer instantanément l'état du robot, sa position calculée, la vision de ses capteurs (LIDAR, Optique) et l'étape de la stratégie en cours d'exécution, et faciliter la partie log.

### 2. Finaliser le Filtre de Kalman et la Teensy Capteur

L'EKF (Filtre de Kalman Étendu) est partiellement implémenté de manière théorique dans la branche `main`. L'objectif est de le compléter et potentiellement de valider son exécution sur une **Teensy Capteur** dédiée. Cela permettrait de délester la boucle temps-réel des moteurs et d'exploiter à 100% l'IMU et le flux optique pour éliminer totalement la dérive d'odométrie. Cela va de pair avec la finition de la Teensy Capteur

### 3. Implémentation de la Caméra

La branche `features/camera_finir_implementation` contient les prémices du pipeline de vision (calibration et détection ArUco). L'objectif est de finaliser la détection des objets à déplacer sur la table, d'affiner le calcul de distance, et surtout de l'intégrer nativement dans la machine à états de la stratégie pour des actions conditionnelles.

### 4. Optimisation Globale du Code

Un grand nettoyage s'impose. Il faudra finaliser l'intégration de la branche `modification_durant_la_cdr_a_clean` dans `main`. Il est également nécessaire de supprimer les vestiges de code mort (comme le recalage Lidar par SVD ou `lidar_logic.py`) afin de clarifier le dépôt.

### 5. Optimisation du LIDAR

Le Pathfinder (`A*`) n'a pas été prouvé en match. Il faudra le tester en conditions réelles avec le robot en mouvement. L'algorithme de clustering du **RPLidar A2M8** doit être affiné pour gérer la disparition des adversaires. L'évaluation de l'outil `rerun.io` (actuellement dans `feature/rerun.io_a_voir`) est fortement recommandée pour se doter d'un outil de debug visuel 3D performant.

### 6. Réalisation des Actionneurs

L'ancienne base de code d'actionneurs héritée doit être remplacée. Il appartiendra à l'équipe mécanique de concevoir les nouveaux actionneurs pour manipuler les éléments de la prochaine thématique Eurobot, et à l'équipe logicielle d'implémenter leurs commandes asynchrones depuis la Teensy dédiée.

### 7. Réalisation du PAMI

Le règlement Eurobot requiert la mise en place d'un robot secondaire (PAMI). La prochaine équipe devra concevoir ce robot, définir son architecture (probablement plus simple que le DaVinciBot) et assurer sa synchronisation ou son indépendance vis-à-vis du robot principal.

### 8. Stratégie

Cela va avec les actionneur et les pamis, nous devront trouver une solution pour comment gérer la stratégie, que ce soit avec base de données, arbre de décision etc.

### 9. Kiffer et Apprendre

Ce projet est avant tout pour apprendre, être curieux et s'amuser. Et après, si on bat Paris à un match, c'est encore mieux
---

## 📝 Note à la nouvelle équipe

Bienvenue dans le pole Info, vous héritez d'une base assez solide mais qui va etre encore mieux cet année.
**Pour bien commencer :**

- N'hésitez pas à tout lire, à poser des questions et, surtout, à comprendre. Ne restez pas plusieurs semaines avec des questions.
- Penser a lire aussi la partie Outils et les incontournables
- Si vous avez des questions ou l'impression qu'il manque des éléments dans la doc, n'hésitez pas.

Good luck pour cette année, mais vous allez tout défoncer !! De toute façon, vous êtes le meilleur pôle (Désolé la méca et l'elek)
