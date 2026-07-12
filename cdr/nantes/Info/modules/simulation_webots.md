---
id: simulation-webots
title: Simulation Webots et Bascule Matérielle
sidebar_label: Simulation Webots
---

# Simulation Webots et Architecture Unifiée A VOIR SI ON GARDE

Ce module documente le fonctionnement de l'environnement de simulation Webots, la manière dont il se substitue au matériel physique (Teensy, encodeurs, LIDAR), et la mécanique logicielle permettant de basculer de manière transparente entre le code simulé et le robot réel.

## 1. Architecture de la Simulation

L'environnement de simulation repose sur le logiciel Webots et reproduit le comportement physique et logiciel de la base holonome à 3 roues.
Au lieu de communiquer via USB avec une véritable carte Teensy, le code haut-niveau Python communique avec un **contrôleur Webots écrit en C++** (`teensy_controller.cpp`).

### Le Contrôleur Webots (`teensy_controller.cpp`)

Ce contrôleur C++ agit comme un "jumeau numérique" du firmware de la Teensy Moteur :

- Il instancie exactement les mêmes objets mathématiques que le vrai robot, notamment la classe `Holonomic_Basis` et les contrôleurs `PID` (`x_pid`, `y_pid`, `theta_pid`).
- La boucle principale s'exécute au rythme du simulateur (`wb_robot_step`) et appelle cycliquement `update_odometry()`, `handle()`, et `execute_movement()`.
- Il interagit avec les actionneurs Webots via `fake_stepper.cpp` qui convertit les consignes de vitesse en commandes pour les objets 3D "motor1", "motor2", "motor3".

> [!WARNING] Mocking des Capteurs Avancés
> Actuellement dans `teensy_controller.cpp`, les initialisations des capteurs `PAA5100` (flux optique) et `Adafruit_BNO085` (IMU) sont commentées (`//paa5100 = new PAA5100();`). La simulation repose donc principalement sur l'odométrie issue des roues codeuses simulées. La fusion de données (décrite dans l'odométrie PID) n'est que partiellement émulée dans l'environnement virtuel.

### Simulation du LIDAR

Le LIDAR est simulé via le composant Webots natif (`wb_lidar_get_range_image`).
La fonction `process_lidar_scan()` dans le contrôleur lit les 360 points de résolution et les découpe en 4 messages successifs de 90 points (`part1` à `part4`). Cela permet de respecter la limite de 255 octets imposée par le protocole de communication série, reproduisant fidèlement les contraintes matérielles du vrai RPLIDAR A2M8.

## 2. Pont de Communication Série (Virtual COM)

Afin que le code Python (exécuté sur Raspberry Pi ou PC) n'ait pas à être modifié, la communication avec le contrôleur Webots s'effectue via un port série virtuel (ex: Virtual Serial Port Tools ou com0com pontant `COM1` et `COM2`).

La classe Python `WebotsComBridge` (dans `robot1/Raspberry Pi/utils/webots_com.py`) remplace la classe matérielle `Com`.
Elle assure :

- L'empaquetage des messages au format exact du protocole C++ : `[ID_Message] [Données] [Taille] [CRC8] [Signature 0xBA 0xDD 0x1C 0xC5]`.
- Le calcul à la volée du CRC8 (`crc8.crc8()`) pour valider l'intégrité des trames comme sur le robot réel.
- La gestion asynchrone via un thread de réception dédié (`_receiver()`) qui écoute en continu le port COM virtuel.

## 3. Mécanisme de Bascule (Simulation vs Hardware)

La force de cette architecture réside dans l'utilisation du **même code Python unifié** (`test_unified.py`) pour le robot physique et le simulateur. La bascule s'effectue grâce à deux composants logiciels : le chargeur contextuel `robot_context.py` et le script `switch_mode.py`.

### Détection de Contexte (`robot_context.py`)

La fonction `is_simulation()` détermine l'environnement actif selon l'ordre de priorité suivant :

1. **Variable d'environnement système** : `ROBOT_MODE=simulation` (priorité maximale).
2. **Présence d'un marqueur** : Un fichier vide nommé `.simulation_mode` dans le dossier de travail.
3. **Configuration JSON** : Valeur du port défini dans `config.json` (un `port: COM1` déclenche le mode simulation).
4. **Dossier d'exécution** : Si le chemin contient le mot `simulation`.

{/*robot1/rasp/utils/robot_context.py*/}

```python
def is_simulation() -> bool:
    robot_mode = os.environ.get('ROBOT_MODE', '').lower()
    if robot_mode == 'simulation':
        return True
    # ...
    current_dir = Path.cwd()
    if (current_dir / '.simulation_mode').exists():
        return True
    # ...
    if 'simulation' in str(current_dir).lower():
        return True

    return False
```

Lors de l'appel à `init_robot()` ou `create_com()`, le contexte instancie de manière transparente soit la classe matérielle `Com` (configurée avec le vrai VID/PID Teensy : 5824:1155), soit la classe `WebotsComBridge` ciblée sur le port virtuel `COM1`.

### Bascule Rapide Manuelle (`switch_mode.py`)

Pour faciliter la vie des développeurs lors des tests croisés, le script `switch_mode.py` réécrit dynamiquement le fichier `config.json` pour forcer la configuration globale de communication.

- **`python switch_mode.py simulation`** : Applique le dictionnaire `SIMULATION_CONFIG`, cible le port `COM1` et active les classes virtuelles (`DummyCom`).
- **`python switch_mode.py hardware`** : Applique le dictionnaire `HARDWARE_CONFIG`, et restaure les Serial Numbers, VID et PID nécessaires pour la connexion directe USB avec la vraie carte Teensy.

{/*robot1/rasp/switch_mode.py*/}

```python
    if mode == 'simulation':
        print(" Bascule vers SIMULATION...")
        config = SIMULATION_CONFIG
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
        print(" Mode SIMULATION activé (COM1)")
    elif mode == 'hardware':
        print(" Bascule vers HARDWARE...")
        config = HARDWARE_CONFIG
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
        print(" Mode HARDWARE activé (Teensy USB)")
```

Exécuté sans argument, le script détecte le mode actuel en parsant `config.json` et propose une bascule interactive dans le terminal.
