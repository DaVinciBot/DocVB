---
id: architecture
title: Architectures Elek CDR Nantes 2025-2026
description: Schéma électronique général du robot, câblage Teensy (groupes de pins, protocoles UART/RS485/I2C) et comparatif UART vs RS485 pour les drivers moteurs.
sidebar_label: Architecture Électronique
sidebar_position: 1
tags: [cdr, nantes, robotique, electronique]
additional_contributors:
  - username: Antoine Fleury
    html_url: https://github.com/Antoine190
    avatar_url: https://github.com/Antoine190.png
---

## Schéma Elek général

![Schéma électronique général](/img/cdr/nantes/elek/architecture/schema-general.png)

Le but est :
La RPi fais une décision de trajectoire (path finding) → envoie l'instruction correspondante à la teensy → la teensy envoie les instructions correspondantes aux drivers → les drivers alimentent correctement les moteurs pour qu'ils tournent de la manière décrite → le mouvement est fait - les capteurs recup la data → data envoyé à la teensy (IMU + CO + encodeurs) → teensy fait lidar + IMU + CO pour calculer position actuelle et PID → envoie position à la rasp → Rasp récupère Lidar pour trouver robot adverse → path finding → boucle

## Schéma Elek Teensy

![Schéma de câblage du Teensy](/img/cdr/nantes/elek/architecture/schema-teensy.png)

### 1. Groupes de pins par fonction

**Alimentation**

- `V+` / `VCC` / `3.3V` / `20V` — tension d'alimentation positive. Ici il y a deux niveaux : **20V** (puissance moteur, arrive sur M1/M2/M3 en `V+`) et **3.3V** (logique, pour le Teensy, l'IMU, les convertisseurs TTL→RS485)
- `GND` — la masse, le retour commun à 0V. Absolument tous les modules doivent partager le même GND, sinon les signaux logiques n'ont pas de référence commune et ça ne fonctionne pas
- `PE` — terre de protection (Protective Earth), souvent reliée au châssis métallique pour la sécurité, pas pour la logique

**Communication série asynchrone (UART) : RX / TX**

- `RX` (Receive) — pin qui **reçoit** les données
- `TX` (Transmit) — pin qui **envoie** les données
- Règle d'or : le TX d'un module se branche sur le RX de l'autre, et inversement (croisé), jamais RX→RX ou TX→TX
- Sur ton schéma, le Teensy a plusieurs UART matériels (0-RX1/1-TX1, 7-RX2/8-TX2, etc.) — chacun est une paire indépendante

**Communication différentielle : RS485-A / RS485-B**

- Contrairement à l'UART classique (TX/RX en logique 0V/3.3V référencée à la masse), le RS485 transmet un signal **différentiel** sur deux fils, `A` et `B`
- La donnée est encodée dans la *différence de tension* entre A et B, ce qui le rend beaucoup plus résistant au bruit électrique et permet de longs câbles (jusqu'à ~1km) — idéal pour piloter des moteurs qui génèrent des interférences
- `COM` — souvent la masse de référence du bus RS485

**Contrôle moteur (spécifique aux MKS SERVO57C)**

- `EN` (Enable) — active/désactive le driver moteur
- `DIR` (Direction) — sens de rotation
- `STP` (Step) — une impulsion = un micro-pas moteur (logique pas-à-pas classique)
- `A+/A-`, `B+/B-` — les deux bobines du moteur pas-à-pas (deux phases)

**Bus I2C (pour capteurs)**

- `SDA` (Serial Data) — ligne de données, bidirectionnelle
- `SCL` (Serial Clock) — ligne d'horloge, cadencée par le maître (ici le Teensy)
- Contrairement à l'UART, plusieurs appareils peuvent partager le même bus I2C (adressage), c'est pour ça que le BNO085 (IMU) et le capteur optique s'y connectent probablement ensemble

**IMU spécifique (BNO085)**

- `INT` — pin d'interruption, prévient le microcontrôleur qu'une nouvelle mesure est prête
- `RST` — reset matériel du composant
- `CS` — Chip Select, utilisé si on communique en SPI plutôt qu'en I2C (le BNO085 supporte les deux)
- `P0/P1/BT` — pins de configuration du mode de communication du capteur

### 2. Les protocoles en présence

| Protocole | Usage ici | Pourquoi celui-là |
| --- | --- | --- |
| **UART (série simple)** | Teensy ↔ module TTL-vers-RS485 | Simple, un seul émetteur/récepteur, mais sensible au bruit et limité en distance |
| **RS485** | Module TTL↔RS485 vers M1, M2, M3 | Robuste, longue distance, tolère le bruit des moteurs. Le Teensy ne parle pas RS485 nativement, d'où les convertisseurs TTL→RS485 intermédiaires |
| **I2C** | IMU (BNO085), capteur optique | Bus partagé, peu de fils (2 signaux + alim), adapté aux capteurs qui n'ont pas besoin de haut débit |
| STEP/DIR | Teensy → drivers moteurs (si utilisé en mode step/dir plutôt que RS485 pur) | Contrôle très direct et rapide du mouvement pas-à-pas, mais pas de retour d'info (pas de feedback comme en RS485) |

### 3. UART vs RS485 pour les driver

![UART vs RS485](/img/cdr/nantes/elek/architecture/uart-vs-rs485.svg)

- **UART** : liaison croisée point-à-point. TX d'un côté → RX de l'autre, et inversement. Le sens du signal est porté par deux fils séparés.
- **RS485** : liaison différentielle non croisée. Les deux modules partagent la paire A/B ; l'information est portée par la différence de tension entre A et B, pas par un fil dédié à chaque sens.
