---
title: Modules principaux du robot principal
description: "Fiches des modules du robot principal — non rédigées : le brouillon de passation était vide."
sidebar_label: Modules
sidebar_position: 1
tags: [cdr, paris, info, robot-principal, robotique]
---

:::danger[Contenu manquant]
Le brouillon de passation `doc_info_bot_ladyyy_modules_principaux.md` ne contenait que la
mention « à faire ». Aucune fiche module n'a été rédigée pour le robot principal.

Cette page existe pour que la place soit prise dans l'architecture, pas parce que le contenu a été
écrit. Rien n'a été inventé ici.
:::

## Ce qui existe déjà ailleurs {/* #ailleurs */}

En attendant, la section
[« Modules logiciels principaux »](../index.md#architecture) de la vue d'ensemble décrit chaque
brique du code (`main.py`, `brains/main_brain.py`, `botladyyy_strategy/`, `common/strategy/`,
`common/navigation/`, `common/arena/`, `controllers/`, `common/usb_com/`, `config.json`) — de façon
plus succincte que le format de fiche, mais c'est la source la plus complète disponible.

## Format attendu {/* #format */}

Pour chaque module important : rôle, raison d'être, entrées, sorties, modules ou composants avec
lesquels il communique, état actuel, limites connues, points à améliorer. Voir
[Modules des PAMIs](../../pami/info/modules.md) ou
[Modules du calcul déporté](../../calcul-deporte/info/modules.md) pour un exemple rempli.
