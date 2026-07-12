---
id: schemas
title: Schémas et Flux de Données
description: Diagrammes Mermaid de l'architecture matérielle, de la communication et des flux de données du robot.
slug: schemas
sidebar_label: Schémas et Flux
sidebar_position: 2
tags: [cdr, nantes, robotique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

:::warning À refaire
Ces schémas doivent être repris et mis à jour.
:::

Ces diagrammes Mermaid ont été générés fidèlement à partir du fichier de conception original (`schema_info_v2.drawio`).

## 1. Architecture Matérielle et Communication

Ce diagramme illustre le cheminement des données depuis les algorithmes de la Raspberry Pi jusqu'aux moteurs, ainsi que le système de remontée des capteurs.

:::danger Doute sur l'intégration matérielle issu du .drawio
Le schéma d'origine mentionne explicitement une `Teensy_Capteur` (T1) distincte de la `Teensy_moteur` (T2), dialoguant via un bus UART à 115200 bauds. Comme précisé dans la vue d'ensemble, cette architecture de filtrage par Kalman (T1) a été abandonnée et n'est pas déployée dans la version post-CDR. Le diagramme la conserve ici pour archiver l'architecture de référence initialement visée.
:::

```mermaid
flowchart TD
    %% Raspberry Pi
    subgraph Rasp [Raspberry Pi 5]
        RASP_OUT[RASP Function: Send Target Position]
        COM_PY[COMMON USB PY Class Com]

        RASP_OUT --> COM_PY
    end

    %% Communication
    USB((Communication Rasp <-> Teensy USB))
    COM_PY <--> USB
    USB <--> COM_CPP

    %% Teensy Moteur
    subgraph T2 [Teensy_moteur]
        COM_CPP[COMMON USB CPP Class Com]
        IN_USB[Teensy_moteur Input: USB Commands]
        MAIN_T2[T2_Program: main loop and timer interruption_compute]

        COM_CPP --> IN_USB
        IN_USB --> MAIN_T2

        subgraph Classes_T2 [Classes de Contrôle]
            HOLO[T2_Class: HolonomicBasis]
            PID[T2_Class: PID]
            MKSG[T2_Class: MKSGroup]
            MKS[T2_Class: MKSServo]
        end

        MAIN_T2 --> HOLO
        HOLO <--> PID
        HOLO --> MKSG
        MKSG --> MKS

        UART_IN[T2_IO_Input: UART Serial4 from Teensy_Capteur]
        FUNC_RECV[T2_Function: receive_sensor_data]
        FUNC_UPDATE[T2_Function: update_from_sensor_deltas]

        UART_IN --> FUNC_RECV --> FUNC_UPDATE --> HOLO

        RS485_OUT[T2_IO_Output: RS485 MotorSpeed W1 W2 W3]
        RS485_IN[T2_IO_Input: RS485 Encoders W1 W2 W3]

        MKS --> RS485_OUT
        RS485_IN --> MKS
    end

    %% Teensy Capteur (Abandonné / Futur)
    subgraph T1 [Teensy_Capteur - Architecture Abandonnée]
        MAIN_T1[T1_Program: main loop]
        SPI_BUS[T1_IO_Bus: SPI]
        I2C_BUS[T1_IO_Bus: I2C]

        PAA[Capteur Optique PAA5100JE]
        IMU[IMU BNO085]

        PAA <--> SPI_BUS
        IMU <--> I2C_BUS

        SPI_BUS --> MAIN_T1
        I2C_BUS --> MAIN_T1

        UART_OUT[Output UART Serial4: dx, dy, dtheta]
        MAIN_T1 --> UART_OUT
    end

    UART_OUT -- "UART 115200 bauds" --> UART_IN
```
