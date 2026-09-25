---
id: index
title: Documentation Électronique DaVinciBot Nantes
description: Vue d'ensemble de l'électronique du robot holonome DaVinciBot (ESILV Nantes) — liste des composants et pages détaillées (architecture, cartes d'alimentation).
sidebar_label: Électronique
sidebar_position: 4
tags: [cdr, nantes, robotique, electronique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

## Navigation

- [Architectures Elek CDR Nantes 2025-2026](./architecture.md)
- [Carte Alimentation CDR Nantes 2025-2026 (V3)](./carte-alimentation.md)
- [Power Delivery 25-26 (non modulable)](./power-delivery.md)

## Liste des composants

- Teensy 4.1 - Microcontrolleur - reliée aux moteurs, capteurs, RPi
- Rasp 5 4Gb - Micro ordinateur - cerveau de l'opération, master des Teensy, récupère les données lidar, fais le calcul de position du robot, et de trajectoire.
- BNO085 - IMU (gyroscope et accélérometre) - renvoie angle de rotation du robot autour de son axe vertical central par rapport à un angle 0 définie à travers une calibration (voir doc info calibration IMU); et renvoie accélération du robot.
- PAA5100JE - Capteur Optique - renvoie distance en x et y parcourue sur un micro laps de temps (c'est donc un dx et dy (apprenez vos cours d'APV et Meca Flu))
- Lidar A2m12 - Lidar 2D - renvoie une liste de position x et y de tout les points autour du robot sur le plan horizontal au niveau du lidar.
- TTL - RS485 - Convertisseur langage : TTL = langage standard de communication inter micro controlleurs || RS485 = langage utilisé de temps en temps, ici au sein du driver des moteurs (qui sont accolés aux moteurs)
- Buck Convertor - Convertisseur de tension ultra standard en iot - 15V vers 5V ici. Se calibre avec un tournevis, en le branchant au multimetre numérique à l'étage.
- Nema 23 - moteurs classiques de robotique. Nema = marque/modèle; 23 = série de taille/ couples des moteurs → nema17 généralement moins puissant que les Nema23 mais le plus grand nema17 est plus puissant que le plus petit Nema23.
- MKS SERVO 57D - Driver de moteurs - convertis instructions en courant/tension.
- Encodeurs - capteurs de rotation sur les moteurs - intégrés sur les drivers - classique en robotique
