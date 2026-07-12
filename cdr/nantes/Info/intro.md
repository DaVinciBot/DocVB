---
id: intro
title: Introduction
sidebar_position: 0
---

# Projet DaVinciBot

Bienvenue dans la documentation officielle du projet **DaVinciBot**, le robot développé par l'équipe **ESILV Nantes** pour la Coupe de France de Robotique.

L'objectif principal du robot est de marquer un maximum de points sur une table de jeu normée lors de matchs d'une durée stricte de **90 secondes**, le tout de manière totalement autonome.

## Résumé Technique

Le système repose sur une architecture maître-esclave conçue pour séparer la logique décisionnelle haut niveau de l'exécution temps réel :

- **Architecture Maître/Esclave** : Une **Raspberry Pi 5** embarquant l'intelligence artificielle et la stratégie commande une carte **Teensy 4.1 (Teensy Moteur)** chargée de la cinématique et des asservissements matériels.
- **Protocole Série Robuste** : La communication entre ces deux cerveaux est assurée via USB par un protocole sur-mesure sécurisé par des trames à CRC8, garantissant la fiabilité des envois de consignes et la remontée d'odométrie à 100 Hz.
- **Cinématique Holonome & Fusion de Capteurs** : Le déplacement fluide de la base à 3 roues holonomes (120°) est asservi par un système de PID alimenté par un filtre complémentaire adaptatif (fusionnant les encodeurs magnétiques, une centrale inertielle BNO085 et un capteur de flux optique PAA5100). **Des changements vont etre réaliser sur le capteur optique**
- **Détection d'Adversaires** : Un **RPLidar A2M8** tourne en tâche de fond pour alimenter un algorithme de clustering garantissant l'évitement des robots ennemis.
- **Simulation Webots Unifiée** : Un jumeau numérique dans Webots permet d'exécuter et de tester exactement le même code Python de stratégie sans nécessiter le robot physique, grâce à un ingénieux pont de communication virtuel (`switch_mode.py`). **N'est plus a jour avec le changement de com des moteur mais a réutiliser si vous le souhaitez**

## Statut Actuel du Projet

Cette documentation s'efforce d'être honnête quant à la maturité des différents modules :

- **Base bas niveau (A Optimiser)** : L'asservissement PID, l'odométrie, la communication série et la cinématique ont été tester lors d'un premier match. La partie la plus fiable est la communication série, le reste est encore assez bancale mais rapide a tester et a valider avec un protype.
- **Couche haut niveau (Expérimentale)** : Nous avons rien pu tester l'année derniere, nous avons différents code fonctionnelle sur le papier : pathfinder, lidar_logic.py, main et robot. Tout ça va etre a reprendre et a améliorer.

Bonne lecture et bon code !
Et pour KER JULIETTE
