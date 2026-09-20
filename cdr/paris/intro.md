---
title: Documentation CDR Paris
description: Accueil de la documentation de la Coupe de France de Robotique de l'équipe DaVinciBot Paris (ESILV), organisée par sous-projet.
slug: intro
sidebar_label: Introduction
sidebar_position: 0
tags: [cdr, paris]
---

Bienvenue sur la documentation de la **Coupe de France de Robotique** de l'équipe DaVinciBot Paris
(ESILV). Elle rassemble la passation technique de la saison **2026** (*Winter is Coming*).

## Par où commencer {/* #par-ou-commencer */}

Si vous arrivez dans l'équipe, lisez dans cet ordre :

1. **[Architecture globale](./transverse/architecture-globale.md)** — les trois systèmes, ce qui
   circule entre eux, et ce qu'il faut retenir en premier.
2. **[Setup de l'environnement de dev](./transverse/setup.md)** — les outils à installer avant
   d'écrire la moindre ligne.
3. La page **Vue d'ensemble** du sous-projet qui vous concerne : elle se lit en entier, une fois.

## Les sous-projets {/* #sous-projets */}

| Sous-projet | De quoi il s'agit |
| --- | --- |
| [Robot principal](./robot-principal/index.md) | Bot Ladyyy : Raspberry Pi, deux Teensy, lidar, stratégie en graphe |
| [PAMIs](./pami/index.md) | Les petits robots autonomes sur ESP32-S3 |
| [Calcul déporté](./calcul-deporte/index.md) | La vision par caméra zénithale sur Jetson |
| [Transverse](./transverse/architecture-globale.md) | Ce qui ne relève d'aucun robot en particulier |

## Comment cette documentation est organisée {/* #organisation */}

Chaque sous-projet suit **le même moule**, pour qu'on puisse passer de l'un à l'autre sans
réapprendre la navigation :

| Page | Ce qu'on y trouve |
| --- | --- |
| **Vue d'ensemble** | Le récit : objectif, architecture, choix techniques, roadmap |
| **Modules** | Une fiche par brique de code |
| **État des lieux** | Ce qui marche, ce qui marche à moitié, ce qui ne marche pas |
| **Débug** | Les pannes de la saison et comment les diagnostiquer |
| **À transmettre** | Ce qui n'entre dans aucune autre case |
| **Tutoriels** | Les procédures propres à ce sous-projet et à cette saison |

Les tutoriels **génériques** (Git, Docker, PlatformIO, LaTeX…) ne sont pas ici : ils vivent dans les
[tutoriels de l'association](/tutorials/intro), qui ne sont pas versionnés par saison.

:::note[Documentation incomplète par endroits]
Plusieurs pages de passation n'ont pas été rendues par l'équipe sortante. Elles existent quand même,
avec un encart qui dit franchement ce qui manque, plutôt que d'être absentes ou remplies de contenu
inventé. Le gabarit à suivre pour les compléter est dans `cdr/paris/_template.md`.
:::
