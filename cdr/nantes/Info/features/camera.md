---
id: camera
title: Détection Caméra (Objets)
---
Implémentation incomplète
Cette fonctionnalité est actuellement en cours de développement sur la branche `features/camera_finir_implementation` et n'est pas encore intégrée à la branche `main`.

# Module Caméra

L'objectif de ce module est la détection visuelle des objets à déplacer sur le plateau de jeu, ainsi que le calcul de leur distance et de leur orientation par rapport au robot.

## Implémentation actuelle

Le code existant (présent dans le dossier `common/`) implémente un pipeline de calibration et de détection basé sur OpenCV et ArUco.

### 1. Calibration de la caméra (`cameracalibration.py`)

Un script dédié permet de calibrer la caméra à l'aide d'un motif en damier (chessboard) :

- **Paramètres du damier** : 9x6 coins internes.
- **Taille des carrés** : 0.025 mètres (25 mm).
- **Processus** : Nécessite au moins 20 captures valides.
- **Sortie** : Les matrices de distorsion et la matrice de caméra générées sont sauvegardées dans `camera_matrix.npy` et `dist_coeffs.npy`.

### 2. Détection et Pipeline (`camfacingDirection.py`)

La classe `ArucoDetector` gère la détection de marqueurs ArUco (`DICT_6X6_50`) pour repérer des objets d'une taille de 5 cm (`0.05m`).

Le pipeline de détection comprend :

- Une exécution dans un thread séparé (`threading`) limitant la fréquence d'acquisition à 15 FPS, pour ne pas bloquer le programme principal.
- L'utilisation de `cv2.solvePnP` pour estimer la pose (vecteurs de translation et rotation) des marqueurs détectés.
- Le calcul de la distance (norme L2 du vecteur de translation).
- Le calcul de l'angle vis-à-vis de l'objectif (`angle_to_face`) et des angles d'Euler (Roll, Pitch, Yaw).

> **Matrice de la caméra par défaut** :
> Si les fichiers de calibration `.npy` sont absents, le système bascule sur la matrice par défaut suivante :
>
> ```python
> [[800,   0, 320],
>  [  0, 800, 240],
>  [  0,   0,   1]]
> ```

## TODO List

Pour finaliser le développement de ce module, les étapes suivantes sont nécessaires :

- [ ] **Intégration** : Intégrer l'instance d'`ArucoDetector` à l'architecture principale du robot et au gestionnaire de stratégie.
- [ ] **Filtrage** : Ajouter un filtrage logiciel (ex: Filtre de Kalman ou moyenne glissante) pour stabiliser le calcul de la distance et des angles.
- [ ] **Environnement Eurobot** : Adapter le dictionnaire ArUco et la taille des marqueurs selon le règlement officiel (si applicable) ou définir ceux utilisés en compétition.
- [ ] **Validation** : Tester les performances de détection sur le matériel final et ajuster les paramètres de calibration selon l'éclairage de la table.
