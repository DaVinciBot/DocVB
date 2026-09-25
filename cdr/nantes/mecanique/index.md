---
id: index
title: Mécanique CDR 2025-2026
description: Conception mécanique du robot holonome DaVinciBot (ESILV Nantes) — base roulante, actionneur, répartition électronique et toit.
sidebar_label: Mécanique
sidebar_position: 3
tags: [cdr, nantes, robotique, mecanique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

Ce rapport a pour but de définir comment monter le robot, et à quoi servent ses différents éléments.

Toutes les dimensions peuvent être retrouvé sur la modélisation Solidworks du robot (cf 3D exp)

## 1 - Base Roulante

### Aperçu

![Aperçu de la base roulante](/img/cdr/nantes/mecanique/apercu-base-roulante.png)

### 1.1 - Plaque de base roulante

Cette plaque a été réalisé en bois de 6mm afin de garantir un centre de gravité du robot   bas, en garantissant la hauteur nécessaire au bon fonctionnement des capteurs. Nous avons pour ambition de changer cette plaque pour une similaire en aluminium de 3mm, plus résistante aux charges et à la déformation et également plus légère.

![Plaque de base roulante](/img/cdr/nantes/mecanique/plaque-base-roulante.png)

### 1.2 - Blocs Moteurs Verticaux

Les blocs moteurs ont été réalisés de manière verticale afin d'optimiser la place dans le robot. On garde ainsi de la place pour les composants électroniques et les différents actionneurs.

La transmission moteur/roue se fait via des poulies et courroies crantées.

![Blocs moteurs verticaux](/img/cdr/nantes/mecanique/blocs-moteurs-verticaux.png)

Nous avons utilisé des profilés en aluminium pour avoir un support résistant aux contraintes imposées par le moteur. Nous n'en utilisons que 2 et non 4 pour réduire le poids total du robot.

Le support du moteur est imprimé en PETG (filament plastique solide) et s'emboite avec les profilés et la base de notre robot.

![Support moteur imprimé en PETG](/img/cdr/nantes/mecanique/support-moteur-petg.png)

La "cage" autour du moteur sert à le maintenir en place en réduisant les vibrations dues à son fonctionnement.

### 1.3 - Tendeurs

Des tendeurs sont présents dans chaque bloc moteur. Ils sont faits en impression 3D et servent à tendre les courroies de transmission, grâce à des petits roulements à bille. Ils servent également à maintenir les roues en place et éviter qu'elles remontent à cause de la tension de la courroie et du poids du robot.

![Tendeur (en rose)](/img/cdr/nantes/mecanique/tendeurs.png)

Le tendeur est représenté en rose dans l'image précédente.

### 1.4 - Roues Holonomes

Nos roues sont omnidirectionnelles, donc nous pouvons nous déplacer comme nous le souhaitons sans rotations mais par translation.

Nous utilisons 3 sets de roues, qui est le minimum pour une base holonome utile, et qui est le plus simple à coder informatiquement (utilisation de 3 moteurs au lieu de 4 par exemple).

![Sets de roues holonomes](/img/cdr/nantes/mecanique/roues-holonomes-sets.png)

Chaque set de roues est composé de 3 roues vissées ensemble. Nous avons choisi 3 roues et non 2 (le minimum) afin d'assurer une adhérence au sol constante et un meilleur équilibre du robot.

![Assemblage d'un set de roues holonomes](/img/cdr/nantes/mecanique/roues-holonomes-assemblage.png)

### 1.5 - Profilés

Les profilés, situés au centre du robot, permettent la structure verticale du robot, en y glissant équerres et inserts, afin de fixer les différents étages.

Ainsi, nous jouons avec la hauteur maximale autorisées par les règles de la Coupe. Les profilés permettent également de modifier facilement la hauteur et la position des différents étages sans avoir à redessiner l'ensemble de la structure. Les seuls éléments contraints sont la hauteur minimale entre la base et le premier étage, nécessaire à l'intégration des moteurs, ainsi que la hauteur maximale autorisée par le règlement.

![Profilés aluminium](/img/cdr/nantes/mecanique/profiles-aluminium.png)

### Assemblage

![Assemblage de la base roulante](/img/cdr/nantes/mecanique/assemblage-base-roulante.png)

## 2 - Actionneur

- Aperçu

  ![Aperçu de l'actionneur](/img/cdr/nantes/mecanique/actionneur-apercu.png)

Notre actionneur sert à pousser le curseur de température (cf règles CdFR 2026). Il est constitué d'un servomoteur rotatif et d'un bras en PLA qui s'abaisse pour pousser le curseur.

Il est conseillé de conserver la base, mais d'adapter la répartition des étages en fonction des besoins des actionneurs. Si vous voulez conserver la forme des étages, seule la hauteur entre la base et le premier étage est soumise à une contrainte minimale afin de garantir l'intégration des moteurs. Les hauteurs des étages supérieurs ont, quant à elles, été définies de manière arbitraire cette année.

## 3 - Etage Electronique

Nos composants électroniques sont répartis entre 3 étages.

Tout en bas, nous avons le capteur optique servant à calculer la position du robot dans l'arène, ainsi que la batterie (élément électronique le plus lourd) pour garder un centre de masse proche du sol.

Le reste des composants sont répartis sur les 2 autres étages en optimisant la place qu'ils prennent.

Cette répartition pourra être modifiée en fonction des composants électroniques utilisés les années suivantes. L'objectif est de conserver un centre de gravité le plus bas possible tout en facilitant l'accès aux cartes électroniques et au câblage.

## 4 - Toit

### Aperçu

![Aperçu du toit](/img/cdr/nantes/mecanique/toit-apercu.png)

### 4.1 - Plaque en bois

Base sur laquelle reposent les différents éléments du toit. avec un trou à l'arrière pour faire passer les câbles.

### 4.2 - Lidar

Cet élément permet de déterminer la position du robot adverse sur la table, et d'empêcher ainsi les collisions. Comme le demande le règlement, il y a un toit au dessus pour coller un code Aruco.

### 4.3 - Bouton d'arrêt d'urgence (BAU)

Cet élément comme son nom l'indique, permet d'arrêter le robot… en cas d'urgence. Et qui dit urgence, dit facilité d'accès et donc toit du robot.

### Résumé

| Caractéristique | Valeur |
| --- | --- |
| Roues | 3 roues holonomes |
| Moteurs | 3 NEMA23 |
| Transmission | Poulies + courroies crantées |
| Structure | Profilés aluminium |
| Pièces imprimées | PETG/PLA  |
| Plaques | Bois 6 mm (prévu : aluminium 3 mm) |
| Nombre d'étages | 3 étages électroniques + toit |
| Ker | Juliette |
