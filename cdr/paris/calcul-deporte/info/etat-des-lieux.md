---
title: État des lieux du calcul déporté
description: Ce qui fonctionne, ce qui fonctionne partiellement, ce qui ne fonctionne pas encore et ce qui a été tenté puis abandonné sur le calcul déporté.
sidebar_label: État des lieux
sidebar_position: 2
tags: [cdr, paris, info, calcul-deporte, vision]
---

État des lieux du **calcul déporté** à l'issue de la Coupe de France de Robotique 2026 (*Winter is Coming*). À lire avec la documentation principale (architecture) et la documentation débug (diagnostic des problèmes).

## Ce qui fonctionne {/* #fonctionne */}

- **La détection ArUco fonctionne très bien** : on détecte les éléments de jeu et on les place précisément sur un plan 2D (repère réel de l'arène, en mètres).
- **La communication avec le robot** : les positions/angles/vitesses et les kaplas (avec leur couleur) sont transmis.
- **La détection par zone** des kaplas fonctionne bien (zonage dépôt / ramassage / départ).
- **L'orchestration du match** : on suit facilement l'avancée de la partie et on lance les PAMIs (assignation des zones de dépôt en fin de match).
- **L'accélération CUDA** est en place (OpenCV recompilé localement avec CUDA sur la Jetson Nano Orin).

## Ce qui fonctionne partiellement {/* #partiel */}

- **La précision de détection** : correcte mais pas parfaite. Elle est limitée par la **qualité vidéo de la caméra** (améliorable) et par le **compromis performance / qualité** de détection choisi.
- **Les performances** : le code est assez optimisé, mais une **réécriture en C++** avec les dernières versions d'OpenCV permettrait de meilleures performances de détection.
- **Le taux de rafraîchissement** : on tourne à ~15 fps, mais dans les faits **3 fps suffiraient** déjà à donner au robot assez de données pour une stratégie solide. Les très hauts FPS ne servent pas à grand-chose ici.
- **La gestion des threads** : fonctionnelle mais mal maîtrisée (code écrit sur une ancienne version de Python), à reprendre.

## Ce qui ne fonctionne pas encore {/* #pas-encore */}

- **Stratégie déportée temps réel « dual-side »** (robot ↔ Jetson) : impossible aujourd'hui à cause du **faible débit du LoRa**, qui nous limite au minimum de données. Nécessiterait un canal bidirectionnel plus performant.
- **Dashboard de supervision** : pas encore de page web / interface temps réel pour contrôler et suivre la Jetson (uniquement du code Python et des flux de diagnostic).

## Ce qui a été tenté mais abandonné {/* #abandonne */}

- **OpenCV via pip sur la Jetson** : abandonné car **sans CUDA**, donc quasi non performant. Remplacé par une **compilation locale d'OpenCV+CUDA** (longue et pénible, voir Débug).
- **Ancienne Jetson Nano** : abandonnée au profit de la **Jetson Nano Orin** (l'ancienne était trop lente, ne serait-ce que pour compiler OpenCV+CUDA).
