---
title: PAMIs
description: "Objectif, architecture, choix techniques et roadmap des PAMIs : les petits robots autonomes sur ESP32-S3 de l'équipe Paris."
sidebar_label: Vue d'ensemble
sidebar_position: 0
tags: [cdr, paris, info, pami, esp32, robotique]
---

:::tip[En une phrase]
Les **PAMIs** sont les petits robots autonomes de l'équipe, sur **ESP32-S3** (firmware PlatformIO dans
`PAMI/`). Deux exemplaires partagent le même code, différenciés **à la compilation** par
`PAMI/include/config.h` : « Normal » (`PAMI_ID 1`) et « Ninja » (`PAMI_ID 2`).
:::

:::warning[Page à rédiger]
Le brouillon de passation des PAMIs a été rendu avec cette page encore au stade du gabarit. Seules les
pages [Modules](./info/modules.md), [État des lieux](./info/etat-des-lieux.md) et
[Débug](./info/debug.md) contiennent du contenu rédigé.

Les sections ci-dessous rappellent ce qui est attendu, et pointent vers ce qui est déjà documenté
ailleurs. À compléter par l'équipe PAMI.
:::

## Objectif de la sous-équipe {/* #objectif */}

À rédiger — en quelques paragraphes :

- quel problème cette partie résout ;
- à quoi elle sert pendant un match ;
- avec quelles autres parties elle interagit ;
- ce qu'un nouveau membre doit comprendre en premier.

Éléments déjà disponibles : les PAMIs sont homologués grâce à un système d'évitement d'obstacle au
lidar, et déclenchent leur stratégie au retrait de la tirette (voir [Modules](./info/modules.md),
fiches *Sensors* et *Strategy*). Le PAMI Normal attend 85 secondes avant de bouger.

## Vision globale de l'architecture {/* #architecture */}

À rédiger — le fonctionnement général : modules logiciels, composants matériels, interactions entre
code et hardware, qui appelle quoi, dans quel ordre les éléments sont lancés, et pourquoi
l'architecture actuelle existe.

L'objectif n'est pas d'expliquer chaque ligne de code, mais de permettre à quelqu'un de comprendre
comment le système fonctionne dans son ensemble.

Éléments déjà disponibles :

- la liste des modules et leur rôle, dans [Modules principaux](./info/modules.md) ;
- la séquence de démarrage bloquante (attente tirette branchée, puis retirée) et le blocage LoRa
  éventuel, dans [Débug](./info/debug.md) ;
- la carte mère ESP32-S3 et le mapping des GPIO, dans
  [Motherboard des PAMIs](./elek/motherboard-pami.md) ;
- la vue d'ensemble des trois systèmes, dans
  [Architecture globale](../transverse/architecture-globale.md).

## Choix techniques et erreurs historiques {/* #choix-techniques */}

À rédiger — les décisions importantes prises pendant l'année :

- pourquoi cette architecture a été choisie ;
- quelles alternatives ont été envisagées ;
- ce qu'il ne faut pas refaire ;
- les erreurs qui ont coûté du temps ;
- les choix qui ont bien fonctionné ;
- les compromis acceptés.

Éléments déjà disponibles : la configuration figée à la compilation, la décomposition du mouvement en
actions élémentaires et le hard-codage des déplacements selon le côté de table sont décrits — et
critiqués — dans [Modules principaux](./info/modules.md) et
[État des lieux](./info/etat-des-lieux.md).

## Roadmap et vision pour l'année prochaine {/* #roadmap */}

À rédiger — objectifs techniques prioritaires, choix d'architecture à conserver ou à revoir, dette
technique importante, fonctionnalités à finir ou à repenser, et ordre de priorité conseillé.

Éléments déjà disponibles, repris des « points à améliorer » des fiches modules :

- simplifier `Rolling Basis`, dont la vitesse dépend de trop de variables éparpillées ;
- rendre la stratégie paramétrable au lieu de la hard-coder par côté de table ;
- implémenter réellement l'exploitation des données du calcul déporté via LoRa — aucun travail n'a
  été commencé dans une branche de développement ;
- lire l'identifiant du PAMI depuis le matériel (strap GPIO) plutôt qu'à la compilation, ce qui
  supprimerait toute une classe de bugs.
