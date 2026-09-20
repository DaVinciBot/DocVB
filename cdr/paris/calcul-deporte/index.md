---
title: Calcul déporté
description: "Objectif, architecture, choix techniques et roadmap du calcul déporté : vision par caméra zénithale sur Jetson, détection ArUco et envoi LoRa."
sidebar_label: Vue d'ensemble
sidebar_position: 0
tags: [cdr, paris, info, calcul-deporte, vision, robotique]
---

:::tip[En une phrase]
Le **calcul déporté** (CD) est la sous-équipe informatique responsable de la **vision par caméra zénithale** au-dessus de l'arène, pour la Coupe de France de Robotique **2026**, thème *Winter is Coming*. Tout le code vit dans le dossier `jetson/`.
:::

## Objectif de la sous-équipe {/* #objectif */}

Le calcul déporté (le code de la Jetson) est responsable de la **perception temps réel de l'arène**. Une caméra placée au-dessus du terrain filme l'ensemble du jeu ; le calcul déporté détecte et interprète les éléments de jeu, puis transmet leur position et les données associées. Par exemple, pour les kaplas, on transmet aussi leur couleur.

Concrètement, le problème à résoudre est le suivant : pendant les **100 secondes** du match, donner au robot et aux PAMIs une **vue d'ensemble du terrain** qu'ils ne peuvent pas avoir depuis le sol, pour qu'ils adaptent leur stratégie au lieu d'agir à l'aveugle.

Pendant un match, le code du calcul déporté :

- capture en continu une **vue zénithale** de l'arène (~15 fps) ;
- détecte les **marqueurs ArUco** de tous les éléments de jeu et les projette dans le **repère réel de la table** (en mètres) ;
- transmet au robot, en continu, les **positions, angles et vitesses** des éléments suivis, ainsi que les **kaplas et leur couleur** ;
- orchestre la fin de match : vers **T+90 s**, il dirige chaque **PAMI** vers une zone de dépôt, en priorisant les zones les plus riches en kaplas de notre couleur et les plus proches.

Les interactions avec les autres parties :

- l'essentiel des échanges se fait **avec le robot** (envoi continu des données observées) ;
- une partie avec les **PAMIs**, surtout pour les diriger vers les bonnes zones en fin de partie et leur attribuer un ID au démarrage ;
- le lien physique est une liaison **LoRa** (pas de WiFi, saturé à la Coupe).

Ce qu'un nouveau membre doit comprendre en premier :

1. Tout tourne dans un seul programme Python, `jetson/main.py`, à ~15 fps.
2. La détection repose sur des **marqueurs ArUco** collés sur tous les éléments de jeu (pas de deep-learning).
3. Une **homographie** calculée à partir de marqueurs de référence convertit les pixels de l'image en coordonnées réelles de l'arène (en mètres).
4. Les résultats sortent de la Jetson **uniquement par LoRa**. La vidéo ne sort qu'en option, comme flux de diagnostic (UDP H.264).

## Vision globale de l'architecture {/* #architecture */}

### Vue d'ensemble matérielle

| Matériel                                | Rôle                                                                                             | Liaison avec la Jetson                      | Code concerné                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------------- |
| Jetson Nano Orin                        | Exécute tout le code Python : capture, détection, projection, orchestration du match, envoi LoRa | /                                           | `jetson/`                     |
| Caméra CSI IMX219 (Raspberry Pi Cam V2) | Vue zénithale de l'arène, flux vidéo temps réel                                                  | CSI (pipeline GStreamer `nvarguscamerasrc`) | `src/camera/`                 |
| Module LoRa DX LR01                     | Communication radio vers le robot et les PAMIs                                                   | UART `/dev/ttyTHS1`, 115200 bauds           | `src/lora/`                   |
| GPU / moteur vidéo du SoC               | Accélération CUDA d'OpenCV et encodage vidéo matériel                                            | Intégré au SoC                              | `src/detector/`, `src/utils/` |

### Modules logiciels principaux

Voir « Modules principaux » pour le détail de chaque fiche. L'orchestrateur `jetson/main.py` relie tout le reste (config `.env`, boucle principale, envoi LoRa).

- `main.py` : point d'entrée, config, boucle de détection temps réel, construction du message vision.
- `src/camera/` : capture caméra CSI accélérée matériellement.
- `src/detector/` : cœur du système (détection ArUco, projection dans le monde, rendu de l'arène).
- `src/arena/` : géométrie des zones de l'arène (dépôt, ramassage, départ).
- `src/game/` : cycle de vie du match, enregistrement des PAMIs, assignation des zones.
- `src/lora/` : transport LoRa (UART) bidirectionnel.
- `src/utils/` : affichage GStreamer et outils de timing/debug.

### Qui appelle quoi

Chaîne de traitement, de la caméra jusqu'au robot :

```
Caméra CSI IMX219 ──(GStreamer / nvargus, GPU)──▶ CSICamera (thread capture)
        │
        ▼
   main.py : boucle de détection (~15 fps)
        │
        ▼
   ArucoDetector.analyze_frame(frame)
     ├─ détection ArUco (DICT_4X4_100) + fallback multi-échelle
     ├─ homographie image vers monde (marqueurs de référence, avec cache)
     ├─ projection : (id, position en m, yaw)
     ├─ filtrage warm-up + lissage temporel (carry-forward)
     └─ rendu 2D de l'arène (matplotlib puis GStreamer)
        │
        ▼
   detected_world = [(id, position, angle), ...]
        │
        ├─▶ historique de positions puis calcul de vitesse (m/s)
        │
        └─▶ build_lora_message(...) → LoRa.queue_send → /dev/ttyTHS1 → robot / PAMIs
```

### Ordre de lancement

1. `main.py` charge la config (`.env`) et choisit le mode (calibration ou détection).
2. Instanciation de la caméra (`CSICamera`), puis chargement de la calibration.
3. Création du détecteur (`ArucoDetector`).
4. Ouverture du LoRa (threads TX/RX sur `/dev/ttyTHS1`).
5. Préparation des sorties d'affichage / stream (sinks GStreamer, option UDP H.264).
6. Entrée dans la boucle principale (~15 fps). Chaque itération : lecture d'image, `analyze_frame`, mise à jour des vitesses, publication de l'état, envoi LoRa selon la phase du match.

### Pourquoi cette architecture

- **Localisation temps réel de tout le terrain sans embarquer de capteurs lourds** sur chaque objet.
- Les ArUco donnent gratuitement l'**identité**, la **position** ET l'**information** (couleur), sans entraîner de modèle.
- Le calcul est **centralisé sur la Jetson** (vue zénithale) et redescendu au robot par un canal radio robuste.
- Un **seul programme Python** : simple à lancer et à déboguer au bord de la table.

## Choix techniques et erreurs historiques {/* #choix-techniques */}

### Choix qui ont bien fonctionné

- **Caméra zénithale + ArUco** plutôt qu'une localisation embarquée ou un modèle de vision. Tous les éléments de jeu portent un ArUco : on détecte en temps réel identité, position **et** information sans entraîner de modèle. Deux kaplas de même couleur portent le même code : l'ArUco **annonce lui-même la couleur**, bien plus fiable qu'une estimation de couleur sensible à la lumière.
- **Les PyCam** (Raspberry Pi Cam V2) : bon compromis qualité d'image / poids des données, assez rapides à analyser localement pour du temps réel.
- **La projection homographique** : précise et efficace pour passer du plan image au plan réel de la table.
- **L'orchestration du match et le lancement des PAMIs** : système propre et robuste. Il n'a pas vraiment servi en compétition, mais l'approche reste bonne. À garder en tête : coder en dur la zone dans chaque PAMI fonctionne aussi et reste beaucoup plus simple.

### Erreurs qui ont coûté du temps

- **OpenCV installé via pip n'embarque pas CUDA** : sur la Jetson, la détection tourne alors sur CPU, quasi non performante.
- Il a fallu **recompiler OpenCV localement avec CUDA + GStreamer**, ce qui est **très long** sur Jetson (grosse source de galère, voir « Débug et problèmes fréquents »).
- Ce problème a aussi motivé le passage de l'ancienne **Jetson Nano** (trop lente, ne serait-ce que pour compiler) à la **Jetson Nano Orin**.

### Compromis acceptés et pièges connus

- **Le LoRa nous limite au minimum de données.** Impossible aujourd'hui de faire un vrai process de stratégie temps réel « dual-side » entre le robot et la Jetson. Compromis assumé, à rediscuter l'an prochain (voir Roadmap).
- **La sensibilité de détection ArUco est volontairement très permissive** pour ne rater aucun vrai élément, ce qui génère des faux positifs. Ils sont filtrés par un **warm-up** (2 hits sur 3 frames) ; les **kaplas et références sont exemptés** car leurs codes appartiennent à un petit ensemble connu (7 ArUcos), où un faux positif est très improbable.
- **Le downscale de la frame (~1.7×)** accélère la détection au prix de la portée : le **fallback multi-échelle** compense pour ne manquer aucun ArUco.

### Ce qu'il ne faut pas refaire

- Rester sur du **LoRa** si un canal plus moderne et non saturé est envisageable.
- **Sous-estimer le temps d'installation d'OpenCV + CUDA** sur Jetson : à prévoir très en amont dans l'année.

### Évolution du code : changements de perspective marquants

1. **Triangulation manuelle vers homographie sur 4 ArUcos de référence.** À l'origine, on utilisait OpenCV pour estimer la distance ArUco/caméra puis on faisait la **triangulation soi-même**. Ce n'était **pas assez précis**. On a donc basculé vers l'**homographie d'OpenCV**, qui projette seule et efficacement les points sur un plan 2D en s'appuyant sur les **4 ArUcos de référence présents sur la carte**.
2. **Compatibilité avec l'OpenCV d'origine de la Jetson vers recompilation avec CUDA.** Au départ, on cherchait à rester compatible avec l'OpenCV intégré de la Jetson (Python 3.6, OpenCV 4.5.1). Mais cette version **n'a pas CUDA**, donc des performances insuffisantes. On a donc recompilé OpenCV localement avec CUDA, ce qui a aussi motivé le passage de l'ancienne Jetson Nano à la **Jetson Nano Orin**.
3. **Capture caméra threadée (drop de frame).** La capture a été déplacée dans un **thread dédié** qui garde toujours la **dernière image** (les images périmées sont abandonnées, `read_frame` fait un simple échange atomique). Objectif : **latence plus faible** et pas de file d'attente d'images à traiter qui s'accumule. Le rythme de détection est découplé du rythme de capture.
4. **Détection sur frame downscalée + fallback multi-échelle.** On downscale la frame (~1.7×) pour accélérer `detectMarkers`. En complément, un **passage multi-échelle** (plusieurs résolutions) garantit qu'on **voit bien tous les ArUcos** : selon la résolution, on n'aperçoit pas toujours tous les marqueurs, alors qu'avec plusieurs résolutions on en voit beaucoup plus. La puissance de la Jetson Orin permet de se le permettre. Le va-et-vient du facteur de downscale (2 vers 1.5 vers 1.65 vers 1.7) n'était que le **réglage fin** du compromis vitesse / portée de détection.
5. **Validation multi-frame (warm-up) des marqueurs, hors kaplas et références.** Les paramètres de détection ArUco sont volontairement **très permissifs** (sensibilité faible) pour ne rater aucun vrai élément de jeu, mais du coup on détecte souvent des « ArUcos » qui n'en sont pas. Le warm-up impose qu'un marqueur soit vu **2 fois sur 3 frames** avant d'être envoyé, ce qui **élimine les faux éléments de jeu** qui apparaissent 1 frame. Les **kaplas et références sont exemptés** : leurs codes correspondent à un petit ensemble connu (7 ArUcos), donc un faux positif y est très improbable, alors qu'un faux positif prend en général un code **aléatoire**. Résultat : on garde la haute sensibilité (on ne rate pas les vrais éléments) sans polluer les données avec du bruit.
6. **Du simple streaming à un vrai cycle de match (`MatchState`).** On a décidé que la **gestion des PAMIs se ferait sur la Jetson**. Enchaînement : au début de partie, le robot envoie le signal de départ à la Jetson (qui commence à détecter) ; à la fin du match, la Jetson **dirige les PAMIs vers des zones** ; et dès le démarrage, chaque PAMI **demande un ID à la Jetson**. Comme la Jetson est allumée **bien avant** le début du match, il est logique que ce soit elle (et non le robot, qui pourrait redémarrer pendant la préparation) qui gère l'**identification**. Elle peut ensuite adresser simplement chaque PAMI en fin de partie.

## Roadmap et vision pour l'année prochaine {/* #roadmap */}

### Démarche conseillée

La priorité de l'an prochain n'est pas d'ajouter des fonctionnalités, mais de **fiabiliser les deux fondations** : la performance de détection et le canal de communication. Tant que le LoRa nous limite au minimum de données, déporter de la vraie stratégie sur la Jetson restera hors de portée. L'ordre conseillé est donc : d'abord des **perfs de détection solides** (C++ + OpenCV récent) et un **threading propre**, ensuite un **canal de communication bidirectionnel**, et seulement après les surcouches (stratégie déportée, dashboard).

### À conserver

- La **majorité du code** et l'approche générale (caméra zénithale + ArUco + projection homographique) : c'est propre et éprouvé.
- L'orchestration du match et la gestion des PAMIs sur la Jetson.

### À revoir

- **Passer en C++** avec les dernières versions d'OpenCV pour de meilleures performances de détection.
- **Remplacer le LoRa** par une techno de comm plus moderne et bidirectionnelle (ex. WiFi 6/6E/7, peu utilisé à la Coupe car ça demande un module supplémentaire). Un canal **bidirectionnel temps réel** permettrait de **déporter de la stratégie directement sur la Jetson** et de soulager la Raspberry du robot.
- Ajouter un **dashboard** pour la Jetson à la place d'un simple code Python : par exemple un petit serveur local ouvrant une page web pour contrôler et suivre en temps réel ce qui se passe sur la Jetson.

### Dette technique et nettoyage prioritaire

- **Gestion des threads** à reprendre : le code a été écrit sur une ancienne version de Python et le multithreading a été mal maîtrisé. À reprendre lors du passage en C++.
- **Précision de détection** encore perfectible (dépend aussi de la qualité caméra).

### Objectifs techniques par étape

1. **Fondations perf.** Réécriture C++ avec OpenCV récent et reprise propre du threading. On ne vise pas des FPS élevés (~3 fps suffisent à alimenter la stratégie du robot), mais une détection **stable et précise**.
2. **Canal de communication.** Remplacer le LoRa par un canal **bidirectionnel temps réel**, prérequis pour déporter de la stratégie sur la Jetson.
3. **Surcouches.** Dashboard web de supervision, puis stratégie déportée une fois le canal en place.
