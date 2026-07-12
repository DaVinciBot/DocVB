---
id: intro
title: Introduction
sidebar_position: 0
---

# Projet DaVinciBot (Eurobot)

Bienvenue dans la documentation officielle du projet **DaVinciBot**, le robot développé par l'équipe **ESILV Nantes** pour la Coupe de France de Robotique (Eurobot). 

L'objectif principal du robot est de marquer un maximum de points sur une table de jeu normée lors de matchs d'une durée stricte de **90 secondes**, le tout de manière totalement autonome.

## Résumé Technique

Le système repose sur une architecture maître-esclave conçue pour séparer la logique décisionnelle haut niveau de l'exécution temps réel :

- **Architecture Maître/Esclave** : Une **Raspberry Pi 5** embarquant l'intelligence artificielle et la stratégie commande une carte **Teensy 4.1 (Teensy Moteur)** chargée de la cinématique et des asservissements matériels.
- **Protocole Série Robuste** : La communication entre ces deux cerveaux est assurée via USB par un protocole sur-mesure sécurisé par des trames à CRC8, garantissant la fiabilité des envois de consignes et la remontée d'odométrie à 100 Hz.
- **Cinématique Holonome & Fusion de Capteurs** : Le déplacement fluide de la base à 3 roues holonomes (120°) est asservi par un système de PID alimenté par un filtre complémentaire adaptatif (fusionnant les encodeurs magnétiques, une centrale inertielle BNO085 et un capteur de flux optique PAA5100).
- **Détection d'Adversaires** : Un **RPLidar A2M8** tourne en tâche de fond pour alimenter un algorithme de clustering garantissant l'évitement des robots ennemis.
- **Simulation Webots Unifiée** : Un jumeau numérique dans Webots permet d'exécuter et de tester exactement le même code Python de stratégie sans nécessiter le robot physique, grâce à un ingénieux pont de communication virtuel (`switch_mode.py`).

## Statut Actuel du Projet

Cette documentation s'efforce d'être honnête quant à la maturité des différents modules :
- **Base bas niveau (Robuste et Testée)** : L'asservissement PID, l'odométrie, la communication série et la cinématique ont été éprouvés lors des matchs de la CDR.
- **Couche haut niveau (Expérimentale)** : L'évitement via le Pathfinder A*, la navigation LIDAR et le Filtre de Kalman Étendu (EKF) n'ont pas pu être totalement validés en match réel. Ils constituent un tremplin idéal pour la prochaine saison.

Bonne lecture et bon code !
