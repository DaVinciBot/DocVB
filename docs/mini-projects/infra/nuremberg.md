---
title: VPS Nuremberg
description: Services tiers auto-hébergés sur le VPS Hetzner de Nuremberg — Pangolin, Headscale, Vaultwarden, Rybbit, Rallly, Docuseal, Uptime Kuma, Enclosed, Plane, Beszel — et leurs sauvegardes.
sidebar_position: 3
tags: [sysadmin, docker, devops, securite]
last_update:
  author: Eliott A. Roussille
  date: 2026-10-07
additional_contributors:
  - username: Eliott A. Roussille
    html_url: https://github.com/aust-1
    avatar_url: https://github.com/aust-1.png
---

Le VPS de Nuremberg héberge les **services tiers** (mots de passe, analytics, signature, sondages...) ainsi que
l'infrastructure de **tunneling** et de **monitoring**. Chaque service vit dans `/srv/<service>` avec son propre
compose et, le plus souvent, un script `backup.sh`.

## Architecture {/*#architecture*/}

```text
Internet ──► Traefik (80/443, dans gerbil) ──► réseau Docker "pangolin" ──► services
                    │
Gerbil (WireGuard 51820/21820 udp) ◄── tunnels vers k3s, homelab, ... (ports 30022-30024)
```

**Pangolin** est le point d'entrée de tout le VPS. Son réseau Docker `pangolin` est partagé (déclaré `external` dans
tous les autres composes) : les services n'exposent aucun port, Pangolin/Traefik les joint par leur nom de conteneur
et gère les certificats Let's Encrypt.

Les services qui ont une base de données la placent sur un réseau `internal` privé, séparé de `pangolin`.

## Services {/*#services*/}

| Service     | Dossier       | Image (version)                            | Rôle                                                 | Réseaux                 |
| ----------- | ------------- | ------------------------------------------ | ---------------------------------------------------- | ----------------------- |
| Pangolin    | `pangolin`    | `fosrl/pangolin` 1.23.0 + gerbil + traefik | Reverse proxy, tunnels et SSO d'accès                | `pangolin` (créé)       |
| Headscale   | `headscale`   | `headscale/headscale` 0.29.4               | Serveur de contrôle VPN Tailscale auto-hébergé       | `pangolin`              |
| Vaultwarden | `vaultwarden` | `vaultwarden/server` 1.37.1                | Gestionnaire de mots de passe (compatible Bitwarden) | `pangolin`              |
| Beszel      | `beszel`      | `henrygd/beszel` + agent 0.20.0            | Hub de monitoring des serveurs                       | `pangolin`              |
| Uptime Kuma | `uptime-kuma` | `louislam/uptime-kuma` 2.5.3               | Surveillance de disponibilité des services           | `pangolin`              |
| Rybbit      | `rybbit`      | `ghcr.io/rybbit-io/*`                      | Analytics web respectueux du RGPD                    | `pangolin` + `internal` |
| Rallly      | `rallly`      | `lukevella/rallly` 4.7.4                   | Sondages de planification (+ notifier DaVinciBot)    | `pangolin` + `internal` |
| Docuseal    | `docuseal`    | `docuseal/docuseal` 2.3.4                  | Signature électronique                               | `pangolin` + `internal` |
| Enclosed    | `enclosed`    | `corentinth/enclosed` 1.16.0               | Partage de notes chiffrées à lecture unique          | `pangolin`              |
| Plane       | `plane`       | installateur officiel (`setup.sh`)         | Gestion de projet / tickets                          | géré par Plane          |

### Pangolin {/*#pangolin*/}

Stack de trois conteneurs :

- **pangolin** : l'API et l'interface de gestion (limité à 600 Mo, `--max-old-space-size=384`).
- **gerbil** : gère les interfaces WireGuard. C'est lui qui **publie les ports** (`80`, `443`, `51820/udp`, `21820/udp`)
  car Traefik partage son réseau (`network_mode: service:gerbil`). Il a les capacités `NET_ADMIN` et `SYS_MODULE`.
- **traefik** : reverse proxy, config dans `config/traefik/`, certificats dans `config/letsencrypt/`.

Ports additionnels de gerbil, redirigés par les tunnels :

| Port        | Usage                               |
| ----------- | ----------------------------------- |
| `30022/tcp` | Redirection SSH pour le cluster k3s |
| `30023/tcp` | Redirection SSH du homelab d'Urbain |
| `30024/udp` | Service UDP du homelab              |

Toute la configuration vit dans `/srv/pangolin/config` (une archive `config.1.16.2.bck.zip` conserve l'état avant une
migration). Le dossier `installer/` contient l'installateur officiel.

:::warning
Gerbil dépend de pangolin (`service_healthy`) et Traefik de gerbil : redémarrer toute la stack avec
`docker compose up -d` plutôt que conteneur par conteneur, sinon Traefik perd ses ports.
:::

### Headscale {/*#headscale*/}

Coordonne le VPN Tailscale maillé. La config est dans `config/` (montée en lecture seule) et l'état (base SQLite,
clés) dans `data/`. Le seul port publié est `3478/udp` (STUN). Les utilisateurs et nœuds se gèrent avec :

```bash
docker exec headscale headscale users list
docker exec headscale headscale nodes list
docker exec headscale headscale preauthkeys create --user <id> --expiration 24h
```

### Vaultwarden {/*#vaultwarden*/}

Données dans `./data` (base SQLite, pièces jointes, clés RSA). Configuration par variables dans `.env`. C'est le
service le plus **critique** du VPS : il contient tous les autres secrets. Vérifiez régulièrement que sa sauvegarde
fonctionne.

### Beszel {/*#beszel*/}

Le hub (`monitoring.davincibot.fr`) et l'agent local communiquent par **socket Unix** (`beszel_socket`) plutôt que par
le réseau. L'agent est en `network_mode: host` pour voir les métriques de la machine. Les autres VPS (comme
[Helsinki](./helsinki.md#beszel-agent)) se déclarent dans le hub avec leur propre agent.

La clé et le token de l'agent sont lus dans le `.env` (`BESZEL_AGENT_KEY`, `BESZEL_AGENT_TOKEN`), comme à Helsinki. Ces
valeurs sont fournies par le hub quand on ajoute la machine (bouton « Add System »).

### Uptime Kuma {/*#uptime-kuma*/}

Limité à 448 Mo (`--max-old-space-size=192`), avec une config MariaDB embarquée allégée
(`mariadb-lowmem.cnf`) pour tenir sur le petit VPS. Le socket Docker est monté pour pouvoir surveiller directement
l'état des conteneurs. Les sondes se configurent dans l'interface web.

### Rybbit {/*#rybbit*/}

Dépôt cloné depuis le projet amont (avec ses scripts `setup.sh`, `update.sh`, `restart.sh`). Seul
`docker-compose.yml` est utilisé : **ne pas utiliser `docker-compose.cloud.yml`**, qui expose ClickHouse, Postgres et
Redis sur Internet.

Composants : `clickhouse` (événements d'analytics, journalisation fortement réduite pour économiser disque et RAM),
`postgres` (comptes et sites), `backend` (API, port 3001) et `client` (interface Next.js).

Variables réellement lues par le `docker-compose.yml` (le `.env.example` amont en contient beaucoup d'autres, qui ne
servent qu'au développement, à Rybbit Cloud ou au script `setup.sh`) :

| Variable                                                  | Rôle                                                |
| --------------------------------------------------------- | --------------------------------------------------- |
| `BASE_URL`                                                | URL publique de Rybbit (`https://<domaine>`)        |
| `BETTER_AUTH_SECRET`                                      | Secret d'authentification, **secret**               |
| `DISABLE_SIGNUP`, `DISABLE_TELEMETRY`                     | Fermer les inscriptions, couper la télémétrie amont |
| `MAPBOX_TOKEN`                                            | Carte des visiteurs (optionnel)                     |
| `CLICKHOUSE_DB`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` | Accès ClickHouse                                    |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`       | Accès Postgres                                      |
| `IMAGE_TAG`                                               | Version des images Rybbit (défaut `latest`)         |

Le sous-dossier `monitor-agent/` (avec son propre `.env.example`) est un composant optionnel de l'amont pour surveiller
des régions : **il n'est pas déployé** ici.

### Rallly {/*#rallly*/}

Application + Postgres 15 (réseau `internal`). La connexion se fait en **OIDC** (variables `OIDC_*`) et l'envoi de
mails passe par le SMTP externe (AWS SES, variables `SMTP_*`). `ALLOWED_EMAILS` restreint qui peut se connecter. Le
conteneur `rallly-crosspoll-notifier` (image DaVinciBot, config dans `.env.crosspoll`) est un petit service annexe qui
lit directement la base Postgres de Rallly.

### Docuseal {/*#docuseal*/}

Application + Postgres 15. Les fichiers signés sont dans `./data`. Variables clés : `HOST` (domaine public),
`FORCE_SSL`, `SECRET_KEY_BASE` (ne jamais la changer : elle chiffre les données existantes).

### Enclosed {/*#enclosed*/}

Données dans `./data` (stockage de fichiers, notes chiffrées). Configuration dans `.env`.

### Plane {/*#plane*/}

Installé avec le script officiel (`setup.sh`) dans `plane-app/`, qui génère son propre compose et ses variables. Il
n'est pas décrit comme les autres : utiliser le script pour toute opération.

```bash
cd /srv/plane
./setup.sh   # menu : start, stop, restart, upgrade, backup...
```

## Déployer {/*#deployer*/}

```bash
cd /srv
mkdir -p <service> && cd <service>
# compose + .env, le service doit déclarer le réseau externe "pangolin"
docker compose up -d
```

Ensuite, dans l'interface de **Pangolin**, créer une *ressource* qui pointe vers `<container_name>:<port>` pour
publier le service sous un sous-domaine de `davincibot.fr`. Aucun port n'est à ouvrir sur le VPS pour du HTTP(S).

Pour un service avec base de données, suivre le modèle de Rallly/Docuseal : deux réseaux (`pangolin` pour l'app,
`internal` pour la base) et un healthcheck `pg_isready` pour ordonner le démarrage.

## Maintenir {/*#maintenir*/}

### Fichiers `.env` {/*#fichiers-env*/}

Seul Rybbit possède un `.env.example` (celui de l'amont). Les `.env` de Vaultwarden, Rallly (+ `.env.crosspoll`),
Docuseal, Enclosed et Beszel (`BESZEL_AGENT_KEY`, `BESZEL_AGENT_TOKEN`) n'ont **pas de modèle** : leurs variables se déduisent des composes (voir les sections ci-dessus),
et leurs valeurs doivent être conservées dans Vaultwarden. Ajouter un `.env.example` à chacun faciliterait une
reconstruction du serveur.

### Mises à jour {/*#mises-a-jour*/}

Aucune mise à jour automatique : toutes les versions sont épinglées. Marche à suivre pour chaque service :

```bash
cd /srv/<service>
# lancer le backup (voir ci-dessous) avant toute montée de version
./backup.sh
# changer le tag dans le compose, puis :
docker compose pull && docker compose up -d
```

Exceptions : **Rybbit** (`update.sh` / tag `IMAGE_TAG` dans `.env`) et **Plane** (`setup.sh`).

### Sauvegardes {/*#sauvegardes*/}

Chaque service stateful a son script `backup.sh`, et `/srv/backups/run-all.sh` les enchaîne. Les archives sont
déposées dans `/srv/backups/<service>` (vaultwarden, rybbit, pangolin, rallly, docuseal, uptime-kuma, enclosed, plane).

```bash
/srv/backups/run-all.sh        # tout sauvegarder
ls -lh /srv/backups/*/         # vérifier les dernières archives
```

:::warning
Les sauvegardes sont **sur le même disque** que les données. Elles protègent d'une erreur de manipulation, pas de la
perte du VPS : prévoir une copie hors machine serait mieux.
:::

### Ressources mémoire {/*#ressources-memoire*/}

Limites mises en place pour tenir dans 4 Go :

| Service     | Limite                                                                      |
| ----------- | --------------------------------------------------------------------------- |
| Pangolin    | `mem_limit: 600m`                                                           |
| Uptime Kuma | `mem_limit: 448m`                                                           |
| ClickHouse  | journalisation interne désactivée (`query_log`, `text_log`, `trace_log`...) |

En cas d'OOM, commencer par `docker stats --no-stream` : ClickHouse (Rybbit) est le suspect habituel.
