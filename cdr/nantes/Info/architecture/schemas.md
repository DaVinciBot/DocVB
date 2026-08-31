---
id: schemas
title: Schémas et Flux de Données
description: Diagrammes Mermaid de l'architecture matérielle, de la communication et des flux de données du robot.
slug: schemas
sidebar_label: Schémas et Flux
sidebar_position: 2
tags: [cdr, nantes, robotique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

Ce schéma est la version à jour du fichier de conception `schema_info_v2.drawio` (synchronisé depuis le dépôt `CDR-Nantes`, août 2026).

## 1. Architecture Matérielle et Communication

Ce diagramme illustre le cheminement des données depuis les algorithmes de la Raspberry Pi jusqu'aux moteurs, ainsi que le système de remontée des capteurs.

:::note
Le schéma représente l'architecture cible à **deux Teensy** (Moteur + Capteur), retenue comme piste pour 2026/27 mais **pas encore implémentée**. La partie LiDAR / haut niveau va être **entièrement refaite cette année**. Le reste (bus RS485 moteurs, protocole USB, capteurs) reflète l'archi actuelle.
:::

![Schéma architecture Nantes](/img/cdr/nantes/info/architecture/schema_nantes.svg)
