---
title: État des lieux des PAMIs
description: Ce qui fonctionne, ce qui fonctionne partiellement, ce qui ne fonctionne pas encore et ce qui a été tenté puis abandonné sur les PAMIs.
sidebar_label: État des lieux
sidebar_position: 2
tags: [cdr, paris, info, pami]
---

État des lieux des PAMIs à l'issue de la Coupe de France de Robotique 2026.

## Ce qui fonctionne {/* #fonctionne */}

- L’actionneur (servo moteur)
- La tirette pour attendre le début du match

## Ce qui fonctionne partiellement {/* #partiel */}

- Le système d’évitement d’obstacle (on vérifie les obstacles toutes les 5ms en mettant en pause les moteurs pendant ce temps, ce qui saccade le mouvement et le ralenti )
- Le mouvement (avancer et tourner) est trop imprécis et lent.
- différentiation entre PAMI normal et PAMI ninja qui est harde codé

## Ce qui ne fonctionne pas encore {/* #pas-encore */}

- Modification de la vitesse sans passer par des paramètres obscures dans le fichier config, ou en faisant des manipulations bizarres (supprimer les println).
- Utilisation intelligente de l’accélération (on a mis une accélération quasi instantanée et ca marchais très bien).

## Ce qui a été tenté mais abandonné {/* #abandonne */}

- Un système d’identification des pamis (pour pas qu’ils fassent la meme action mais aient le même code), abandonné car on avait pas assez de PAMI pour que ce soit utile.
- Utilisation du calcul déporté pour définir la stratégie et l’adaptée pendant le match (on a fini par hard coder les mouvements).
