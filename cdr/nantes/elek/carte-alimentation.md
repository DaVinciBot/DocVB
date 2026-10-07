---
id: carte-alimentation
title: Carte Alimentation CDR Nantes 2025-2026 (V3)
description: Schéma du PCB de la carte d'alimentation V3 — répartition batterie, moteurs, Power Delivery Card et buck converter.
sidebar_label: Carte Alimentation (V3)
sidebar_position: 2
tags: [cdr, nantes, robotique, electronique, pcb]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

## Schéma du PCB

![Schéma du PCB de la carte d'alimentation V3](/img/cdr/nantes/elek/carte-alimentation/schema-pcb.png)

On branche la batterie sur le J1 (en haut à gauche), les moteurs sur J8, J9 et J10, la Power Delivery Card (PCD) sur J3, et le buck converteur (carte 5V) sur J6; un fusible de 12A est suffisant. J4 et J5 permettent d'alimenter d'autres composants en 15V si nécessaire, dans la V1 du robot ils restent vierges.

Les diodes et les capa protègent, respectivement, les composants de frire à cause du back current des moteurs, et de lisser la tension des moteurs.
