---
title: Modules principaux des PAMIs
description: "Fiches des modules du firmware PAMI : moteurs pas-à-pas, base roulante, capteurs (lidar, tirette), stratégie, actions élémentaires et communication LoRa."
sidebar_label: Modules
sidebar_position: 1
tags: [cdr, paris, info, pami, esp32]
---

Chaque module du firmware PAMI est décrit ici selon la même fiche : rôle, raison d'être, entrées, sorties, état actuel et limites connues.

## Motor {/* #motor */}

- Rôle du module : permet d’interagir avec un stepper moteur
- Pourquoi il existe : permet de contrôler la vitesse et l’accélération d’un moteur. Il est équipé d’une fonction update qui permet de contrôler régulièrement le mouvement.
- Entrées : vitesse / accélération en float
- Sorties : rotation du moteur à la vitesse voulue
- Modules ou composants avec lesquels il communique : Moteur stepper (genre Nema 17)
- État actuel : fonctionne par l’utilisation d’une fonction DoOneStep qui est appelée régulièrement.
- Limites connues : modification de l’accélération et de la vitesse qui n’a pas de réel influence dans la vrai vie.
- Points à améliorer : voir réponse précédente.

## Rolling Basis {/* #rolling-basis */}

- Rôle du module : Permet de coordonner la rotation des deux moteurs de classe motor du PAMI pour par exemple tourner ou avancer.
- Pourquoi il existe : Permet de donner un point de destination et à partir des coordonnées du PAMI, il tourne d’abord, puis avance pour aller au point d’arrivée.
- Entrées : Objet de la classe point (x, y, thétha) pour donner la destination (théta n’est pas utilisée)
- Sorties : le PAMI tourne puis avance pour aller au point.
- Modules ou composants avec lesquels il communique : Les deux moteurs steppeurs
- État actuel : fonctionne, le PAMI va bien aux points demandés.
- Limites connues : Manque de précision dans les déplacements
- Points à améliorer : Trop de variables inutiles dans le code, la vitesse envoyée aux moteurs dépend de plusieurs variables dans le code de la classe ou dans le fichier config ce qui rend la relecture infame. Le code peut etre tellement simplifié.

## OTA {/* #ota */}

On a pas utilisé pendant cette année

## PID {/* #pid */}

Le PAMI n’en avais pas donc inutile

## Sensors {/* #sensors */}

- Rôle du module : Permet de communiquer avec les capteurs (lidar et tirette) pour récupérer leurs données et les exploiter.
- Pourquoi il existe : Pour l’homologation du PAMI, il fallait un système d’évitement d’obstacle, pour cela, on est parti sur un lidar qui nous permettrais de faire d’autres choses (exemple : système d’identification, cf état des lieux).
- Entrées : demande si il y a un obstacle à une distance qu’on peut donner.
- Sorties : La fonction qu’on utilisait surtout était obstacleDirectlyAhead qui renvoyait un bool pour dire si un obstacle était détecté en face du PAMI
- Modules ou composants avec lesquels il communique : le lidar GS2 de YDLIDAR
- État actuel : marche suffisamment pour nous permettre d’homologuer le PAMI.
- Limites connues : Le lidar peut parfois donner des valeurs absurdes, j’ai pour cela fait un système de moyenne de distance avec les points voisins pour les éliminer. Il faut également faire attention car le lidar ne peut réalistiquement que detecter devant le PAMI don la detection d’obstacle ne marchent pas en marche arrière ou en rotation, mais ca a jamais posé problème.
- Points à améliorer : le temps que la detection d’ostacle se fasse dans une action, le robot s’arrete, ce qui saccade un peu le mouvement, mais sinon ca passe.

## Strategy {/* #strategy */}

- Rôle du module : permettre d’enchainer les actions en décrivant avant le match le plan qu’on va suivre. On peut en théorie donner juste les coordonnées des points qu’on va suivre, mais pour la coupe, on a donner les déplacements à faire découper en avancer, tourner, avancer, tourner, etc. avec wait au debut, et déclenchement de l’actionneur à la fin du match.
- Pourquoi il existe : Pour maximiser les points qu’on marque, il faut enchainer les déplacements.
- Entrées : une fonction de la classe Action pour pouvoir les mettre dans une file
- Sorties : Le PAMI suis les déplacements qu’on lui a dis de faire.
- Modules ou composants avec lesquels il communique : Il communique les déplacements aux moteurs et vérifie les obstacles avec le lidar, puis actionne le servo moteur de l’actionneur.
- État actuel : Il a rendu le fichier main.cpp assez brouillon, mais sinon il fait ce qu’on lui demande.
- Limites connues : On a du hard codé les déplacements en fonction de quel coté de la table on était, et on utilisait la stratégie adaptée selon quelle tirette on enlevait, c’est un système D qui a fonctionné, mais qu’il ne faut pas reprendre.
- Points à améliorer : Le fait qu’on ai dû hard codé les déplacements rend impossible le fait d’adapter la stratégie avec le CD par exemple. On pourrait aussi passer par l’utilisation d’enchainement de points pour simplifier la lecture de la stratégie si on doit le hardcoder.

## Com_PAMI {/* #com-pami */}

- Rôle du module : permettre au PAMI de communiquer avec le robot principale ou avec le CD en Lora.
- Pourquoi il existe : On pourrait utiliser une plus grande puissance de calcul pour déterminer la stratégie, et également en récupérant les données du CD. Il permettrais aussi d’identifier les PAMI.
- Entrées : Les instructions données par le robot ou le CD.
- Sorties : La stratégie du PAMI qui changent selon ce qu’il vient de recevoir.
- Modules ou composants avec lesquels il communique : module LORA, puis impacte tout le robot.
- État actuel : On a tester rapidement le lora, et ca semblait marcher, mais on a pas eu le temps de l’intégrer complètement dans tout les robots, on a fait la coupe sans module lora car au final on l’utilisait pas.
- Limites connues : Organisation du format des messages qu’on s’envoyait, et surement d’autres mais non identifiés car pas assez de tests.
- Points à améliorer : Implémenter l’exploitation des données du CD pour adapter la stratégie du CD. Aucune travail n’a été commencé dans une branche de dev_, on avait tout essayé sur des codes minimalistes. C’est indispensable à faire.

## Actuators {/* #actuators */}

Jamais utilisé

## Actions {/* #actions */}

- Rôle du module : défini des actions élémentaires comme avancer, tourner, actionner le servo moteur, attendre, etc.
- Pourquoi il existe : On les a décomposés pour pouvoir les utiliser plus facilement notamment dans la classe stratégie.
- Entrées : une durée pour le servo moteur, et wait, une distance pour avancer, un angle pour la rotation.
- Sorties : Le PAMI fait les instructions élémentaires qu’on lui a demandé.
- Modules ou composants avec lesquels il communique : les moteurs stepper, le servo moteur.
- État actuel : fonctionne, mais a trop de fichier pour des actions qu’on utilisera jamais (on va pas reculer par exemple)
- Limites connues : Certes ca permet de décomposer le mouvement en petites briques, mais on perd en fluidité en faisant ça.
- Points à améliorer : peut être pas reprendre cette méthode de décomposition du mouvement, ça a été décidé par manque de temps et ca rend quelque chose de pas très propre.
