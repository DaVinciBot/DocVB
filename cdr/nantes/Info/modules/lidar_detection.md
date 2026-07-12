---
id: lidar-detection
title: Détection LiDAR (Adversaires)
sidebar_label: LiDAR (Détection)
---

# Détection LiDAR (Adversaires)

Ce document décrit le module de détection d'adversaires via le LiDAR A2M12, implémenté dans `lidar_detection.py`, et son intégration dans la boucle principale du robot (`robot.py`).

> [!NOTE]
> Tout le code expérimental concernant le recalage de position du robot (trilatération SVD, `PoseEngine`, `lidar_logic.py`) n'a jamais étais tester et faudra voir si on l'utiliser si ca a vraiment une utilité et surtout faut le refaire completement. Un code lidar lidar_detection a étais créer la fin de la CDR et fini a 5h du mat donc faudra le valider sérieusement et le tester en condition réel.

## Architecture de la détection (`lidar_detection.py`)

Le LiDAR effectue une détection de l'adversaire de façon simple et robuste, sans tenter de faire correspondre les points à une forme géométrique précise. Cela permet de détecter n'importe quel type de robot adverse. Le processus repose sur le calcul du centroïde d'un cluster de points, suivi d'un lissage temporel.

### Filtrage et Projection

1. **Filtre de qualité et de distance** : Les points bruts reçus par le LiDAR sont filtrés pour ne conserver que ceux ayant une qualité supérieure à `MIN_QUALITY` (5). Les points trop proches (inférieurs à `MIN_DIST_MM` = 200 mm, correspondant à la zone morte du capteur ou à la carrosserie) et trop lointains (supérieurs à `DETECT_DIST_MM` = 1500 mm) sont purement ignorés.
2. **Coordonnées terrain** : Les points locaux retenus sont ensuite projetés dans le repère global du terrain (repère absolu) grâce à la dernière position connue du robot (`_robot_pose`).

### Clustering

Les points projetés sont triés angulairement et regroupés en clusters.

- La distance maximale autorisée entre deux points consécutifs d'un même cluster est définie par la constante `CLUSTER_GAP_MM` (80 mm).
- Un cluster doit contenir un minimum de points, défini par `CLUSTER_MIN_PTS` (3 points), pour être pris en compte. Cela permet d'éliminer les artefacts et le bruit du capteur.

{/*robot1/rasp/lidar/lidar_detection.py*/}

```python
    current = [pts_sorted[0]]
    for i in range(1, len(pts_sorted)):
        if math.hypot(pts_sorted[i][0] - current[-1][0],
                      pts_sorted[i][1] - current[-1][1]) > CLUSTER_GAP_MM:
            clusters.append(current)
            current = [pts_sorted[i]]
        else:
            current.append(pts_sorted[i])
    clusters.append(current)
```

### Tracking et Lissage

Le meilleur cluster — généralement le plus proche du robot parmi ceux étant valides — est sélectionné comme étant l'adversaire.

- **Seuil de confiance (Confidence threshold)** : Un indice de confiance (`confidence`) compris entre 0 et 1 est calculé en fonction de la densité du cluster (`min(1.0, len(cluster) / 8.0)`).
- **Gating de vitesse** : Le module s'assure que le déplacement de l'adversaire entre deux scans est physiquement possible. Si le saut de position implique une vitesse supérieure à `MAX_OPP_SPEED_MM_S` (2500 mm/s), la nouvelle détection est ignorée.
- **Lissage exponentiel** : Pour limiter le bruit de mesure et les tremblements de la position de l'adversaire, les coordonnées du centroïde sont lissées dans le temps grâce au facteur `ALPHA_SMOOTH` (0.4).
- **Oubli** : Si aucun cluster ne correspond ou que les scans sont vides pendant `MAX_MISSED_SCANS` itérations (5 scans), la confiance de la détection tombe à 0 et l'adversaire est considéré comme "perdu".

---

## Intégration dans `robot.py`

La gestion du thread LiDAR et la consommation des données de détection se font directement au sein de la classe `Robot` (`robot1/Raspberry Pi/robot.py`).

### Initialisation et Arrêt

- **Démarrage** : La fonction `lidar.start()` est appelée dans le constructeur `__init__` du robot. Elle instancie un thread démon nommé `LidarDetect` qui gère la communication série avec le matériel en arrière-plan.
- **Arrêt** : Lors de la fin du match ou de l'arrêt d'urgence, la fonction `stopper_tout()` appelle `lidar.stop()` pour s'assurer que le thread et la rotation du moteur LiDAR s'arrêtent proprement.

### Boucle Principale (`update()`)

À chaque itération de la boucle principale de décision (tournant à une fréquence de 20 Hz), les actions suivantes sont réalisées :

1. **Mise à jour de la pose** : La position actuelle du robot, obtenue via l'odométrie de la Teensy (`teensy_x`, `teensy_y`, `teensy_theta`), est envoyée au module LiDAR via `lidar.update_robot_pose(teensy_x, teensy_y, teensy_theta)`.
2. **Récupération de l'adversaire** : Le script interroge la dernière détection valide de l'adversaire en appelant `lidar.get_opponent()`, qui retourne un tuple `(opp_x, opp_y, opp_conf)`.
3. **Validation de la détection** : Si un adversaire est renvoyé et que son **seuil de confiance** est strictement supérieur à `0.1` (`if opp_conf > 0.1:`), la détection est jugée fiable.
4. **Enregistrement de l'obstacle** : L'adversaire est alors ajouté à une liste locale `obstacles`.

{/*robot1/rasp/robot.py*/}

```python
        # 4. Obstacles dynamiques (adversaire détecté par LiDAR)
        obstacles: list = []
        opponent_data = lidar.get_opponent()
        if opponent_data is not None:
            opp_x, opp_y, opp_conf = opponent_data
            if opp_conf > 0.1:
                obstacles.append((opp_x, opp_y))
```

5. **Évitement et Pathfinding** : Cette liste `obstacles` est passée au cerveau du robot lors de la demande de trajectoire (`self.cerveau.get_path(pos, objectif, obstacles)`). Lors du calcul d'évitement, le **rayon du robot ou de détection** pris en compte est de **110 mm**. Cette valeur assure une marge de sécurité autour du point détecté (le centroïde de l'adversaire) pour recalculer une trajectoire sans collision. (Voir [Navigation Haut Niveau](navigation_haut_niveau.md) pour les détails de l'algorithme A*).

> [!WARNING]
> *Ambiguïté dans le code Rerun* : Le code de publication vers le module Rerun (`rerun_bridge.update_obstacles`) affiche actuellement ces obstacles avec un rayon de `200` (`"radius": 200`). Il s'agit uniquement d'une valeur d'affichage graphique pour l'interface de debug, le vrai rayon physique d'évitement utilisé par l'algorithme est bien de 110 mm.
> De maniere plus géneral, Rerun est a revoir et voir si il y a une vrai utilité pour faire de la correction d'erreure et ajustement de PID

### API Publique

Le module expose 4 fonctions simples appelées par le reste du système :

- `start()` : Démarre le thread de traitement LiDAR.
- `stop()` : Stoppe le thread et libère le port série.
- `get_opponent()` : Renvoie les coordonnées et la confiance `(x, y, confiance)` si elles sont récentes (timeout de `STALE_TIMEOUT_S`), sinon `None`.
- `update_robot_pose(x, y, theta)` : Informe le LiDAR de la position du robot pour lui permettre de transposer les points relatifs en coordonnées absolues terrain.
