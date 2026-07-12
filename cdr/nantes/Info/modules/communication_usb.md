---
id: communication-usb
title: Protocole de Communication USB (Raspberry Pi ↔ Teensy)
description: Protocole série sur-mesure entre la Raspberry Pi et la Teensy Moteur — format des trames, table des identifiants, implémentation et tolérance aux pannes.
slug: communication-usb
sidebar_label: Communication USB
tags: [cdr, nantes, robotique, teensy]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

Le projet DaVinciBot utilise un protocole série sur-mesure pour fiabiliser les échanges entre la Raspberry Pi (Haut Niveau) et la Teensy Moteur (Bas Niveau).

Ce module est implémenté symétriquement en Python (`common/usb_com/python/`) et en C++ (`common/usb_com/cpp/`).

## 1. Format des Trames

Chaque message échangé sur le bus série respecte la structure suivante :

|  `msg_type` (1 octet)  | `msg_data` (N octets) |  `msg_length` (1 octet)  | `CRC8` (1 octet)  | `END_BYTES` (4 octets) |
| :--------------------: | :-------------------: | :----------------------: | :---------------: | :--------------------: |
| Identifiant du message |    Payload binaire    | Taille de `msg_data` + 1 | Somme de contrôle |   `\xba\xdd\x1c\xc5`   |

- **`msg_type`** : Définit l'action ou l'événement (ex: `SET_TARGET_POSITION`, `UPDATE_ROLLING_BASIS`).
- **`msg_length`** : Sécurité supplémentaire permettant d'isoler rapidement une erreur de taille de trame avant même de calculer le CRC.
- **`CRC8`** : Assure l'intégrité des données transmises. Ce comportement est désactivable (via `enable_crc=False` côté Python) mais fortement recommandé en conditions de match.
- **`END_BYTES`** : Signature stricte indiquant la fin de la trame, permettant au parseur de se resynchroniser facilement après une coupure ou une interférence.

## 2. Table des Identifiants (`msg_type`)

Les identifiants (`Messages` dans `messages.py` / `messages.h`) respectent une convention de direction stricte :

- **`0` à `126` : Commandes (Raspberry Pi → Teensy)**
- **`127` : NACK (Bidirectionnel)**
- **`128` à `255` : Télémétrie et Réponses (Teensy → Raspberry Pi)**

| ID   | Nom                                   | Direction      | Description                                     |
| :--- | :------------------------------------ | :------------- | :---------------------------------------------- |
| 0    | `SET_TARGET_POSITION`                 | Rasp → Teensy  | Définition de la position cible (base holonome) |
| 1    | `SET_PID`                             | Rasp → Teensy  | Mise à jour des coefficients PID                |
| 2    | `SET_ODOMETRIE`                       | Rasp → Teensy  | Réinitialisation de l'odométrie                 |
| 3    | `SET_SERVO_ANGLE_I2C`                 | Rasp → Teensy  | Définition de l'angle d'un servo en I2C         |
| 4    | `STEPPER_STEP`                        | Rasp → Teensy  | Déplacement d'un moteur pas-à-pas               |
| 5    | `SET_SERVO_ANGLE_DETACH`              | Rasp → Teensy  | Mouvement d'un servo suivi d'un détachement     |
| 6    | `ATTACH_SWITCH`                       | Rasp → Teensy  | Attachement d'un interrupteur                   |
| 7    | `SET_SERVO_ANGLE`                     | Rasp → Teensy  | Définition de l'angle d'un servo                |
| 8    | `SET_STEPPER_DRIVER_ACTIVATION_STATE` | Rasp → Teensy  | Activation/Désactivation du driver stepper      |
| 126  | `RESET_TEENSY`                        | Rasp → Teensy  | Redémarrage logiciel de la Teensy               |
| 127  | `NACK`                                | Bidirectionnel | Signalement d'une erreur CRC ou trame invalide  |
| 128  | `UPDATE_ROLLING_BASIS`                | Teensy → Rasp  | Envoi de l'odométrie haute fréquence            |
| 129  | `SWITCH_STATE_RETURN`                 | Teensy → Rasp  | Rapport d'état d'un interrupteur                |
| 130  | `LIDAR_SCAN_PART1` Pour Webot         | Teensy → Rasp  | Données de scan LIDAR simulé (0-89°)            |
| 131  | `LIDAR_SCAN_PART2` Pour Webot         | Teensy → Rasp  | Données de scan LIDAR simulé (90-179°)          |
| 132  | `LIDAR_SCAN_PART3` Pour Webot         | Teensy → Rasp  | Données de scan LIDAR simulé (180-269°)         |
| 133  | `LIDAR_SCAN_PART4` Pour Webot         | Teensy → Rasp  | Données de scan LIDAR simulé (270-359°)         |
| 254  | `PRINT`                               | Teensy → Rasp  | Message de log ou debug                         |
| 255  | `UNKNOWN_MSG_TYPE`                    | Interne        | Identifiant de commande inconnu                 |

## 3. Implémentation Logicielle

L'architecture logicielle repose sur un système asynchrone basé sur des **callbacks**.

### Côté Raspberry Pi (Python)

- **Fichiers clés** : `com.py` et `messages.py`.
- **Classe `Com`** : Maintient un thread de réception permanent (`_receiver_thread`). Dès qu'un `END_BYTES_SIGNATURE` est détecté, la trame est isolée.
- **Vérification CRC** : Si le hash correspond, le premier octet (`msg_type`) est utilisé comme clé dans le dictionnaire `message_id_callback` pour appeler la fonction correspondante (ex: mettre à jour l'objet `Robot`).

  {/*common/usb_com/python/com/com.py*/}

  ```python
  def add_callback(self, func: Callable[[bytes], None], iid: int) -> None:
      """Registers a callback for a specific message ID.
      ...
      """
      if self.message_id_callback.get(iid) is not None:
          self.logger.warning(f"Overwriting callback for ID {iid}")
      self.message_id_callback[iid] = func
  ```

- **Simulation (`DummySerial`)** : La classe accepte un mode `enable_dummy=True` qui instancie un faux port série. Cela permet de tester les comportements décisionnels de la Raspberry Pi sur PC, sans robot physique (utilisé massivement via `switch_mode.py`).

### Côté Teensy (C++ / PlatformIO)

- **Fichiers clés** : `com.cpp`, `com.h` et `messages.h`.
- **Classe `Com`** : Ne lance pas de thread (monothread C++) mais propose une méthode `handle_callback()` appelée dans le `loop()` principal de la Teensy (`src/main.cpp`).
- **Retransmission automatique** : Le C++ conserve un pointeur `last_message* last_msg`. Si la Raspberry Pi envoie un `NACK (127)`, la Teensy republie ce buffer sans mobiliser la logique métier. La logique miroir est exécutée côté Python.

  {/*common/usb_com/cpp/src/com.cpp*/}

  ```cpp
  // Compute CRC
  byte crc_b = crc.digest(full_msg, size + 1);

  // Send the message
  this->stream->write(msg, size);
  this->stream->write(size);
  this->stream->write(crc_b);
  this->stream->write(this->signature, 4);
  this->stream->flush();
  ```

## 4. Tolérance aux Pannes

Ce module est critique pour le DaVinciBot et embarque plusieurs sécurités :

1. **Désynchronisation** : Le parseur (Python comme C++) lit en flux continu jusqu'à trouver les 4 octets de fin. S'il a lu des octets parasites avant, la validation CRC et la vérification de la taille (`msg_length`) jetteront la trame invalide.
2. **Rejet de trames silencieux** : En cas de crash inopiné d'un côté de la liaison, des exceptions encapsulent la perte de flux et évitent de bloquer le programme distant.
3. **Plug-and-Play (USB)** : Le système Python localise dynamiquement le port série de la Teensy grâce à ses identifiants matériels exclusifs (`vid`, `pid`, et surtout le `serial_number`), ce qui garantit qu'il se connecte à la bonne carte même si le point de montage `/dev/ttyACM*` a changé.
