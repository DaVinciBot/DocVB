---
id: getting-started
title: Guide de démarrage
sidebar_position: 2
---

## 1. Prérequis

### Matériel

- **Ordinateur principal** : PC (Windows/Linux) ou la Raspberry Pi du robot.
- **Microcontrôleurs** : Cartes Teensy 4.1 (Teensy Moteur et Teensy Actionneur).
- **Câbles** : Câbles USB Data pour relier les Teensy et le LIDAR.

### Logiciel

- **Python 3.10+**
- **PlatformIO** (via VSCode ou CLI) pour compiler et flasher les Teensy.
- **Webots** (optionnel, pour la simulation). Le fichier de monde à ouvrir est `simulation/worlds/my_world.wbt`.

## 2. Installation des Dépendances

Il faudra qu'on le mette a jour.
Clonez le dépôt, puis installez les dépendances Python via le fichier `requirements.txt` :

```bash
pip install -r requirements.txt
```

*(Ceci installera notamment `pyserial`, `pyusb`, `rerun-sdk`, `rplidar-roboticia` et `numpy`)*

## 3. Configuration du Matériel (`config.json`)

Les identifiants matériels uniques (comme le Serial Number USB de la Teensy) ne sont pas versionnés dans le code source pour faciliter le changement de carte. Ils doivent être configurés localement.

- Modifiez (ou créez) le fichier `config.json` ou utilisez les variables d'environnement pour définir les identifiants, par exemple le serial_number (ex: `17795370`).

## Lancer en simulation

Pour basculer le système en mode simulation :

1. Exécutez le script de bascule de mode pour configurer l'accès virtuel (port série défini sur `COM1`) :

   ```bash
   python robot1/rasp/switch_mode.py simulation
   ```

2. Lancez le simulateur Webots et chargez le monde de simulation prévu.

## Lancer sur le vrai robot (Hardware)

Pour utiliser le robot physique basé sur la carte Teensy :

1. Compilez et téléversez le code sur la carte Teensy via PlatformIO (projet situé dans `robot1/teensy_moteur` et `robot1/teensy_actuator`).
2. Basculez la configuration pour cibler le matériel réel :

   ```bash
   python robot1/rasp/switch_mode.py hardware
   ```

   Ce mode configure le système pour se connecter à la Teensy en USB (en recherchant spécifiquement le VID `5824`, le PID `1155`).

## 4. Lancer un match réel

Pour lancer le robot en conditions réelles de match, suivez cette séquence stricte :

1. **Alimentation** : Allumez la batterie principale et vérifiez l'alimentation des cartes (LEDs).
2. **Connexions** : Branchez les câbles USB reliant la Raspberry Pi à la Teensy Moteur et au RPLidar A2M8.
3. **Vérification tirette** : Assurez-vous que la tirette de démarrage est bien insérée (état initialisé).
4. **Lancement du script** : Démarrez la logique principale (assurez-vous d'être en mode `hardware`) :

   ```bash
   python robot1/rasp/main.py
   ```

5. **Démarrage du match** : Retirez la tirette. Le chronomètre de 90 secondes se lance et la machine à états de stratégie (`StratManager`) prend le contrôle.
