---
title: Infra VPS
description: Vue d'ensemble des deux VPS Hetzner de DaVinciBot (Helsinki et Nuremberg), de leurs conventions communes et des procédures génériques de déploiement et de maintenance.
sidebar_position: 1
tags: [sysadmin, docker, devops]
last_update:
  author: Eliott A. Roussille
  date: 2026-10-07
additional_contributors:
  - username: Eliott A. Roussille
    html_url: https://github.com/aust-1
    avatar_url: https://github.com/aust-1.png
---

En plus du [cluster k3s](../cluster/cluster.md), DaVinciBot loue deux petits VPS Hetzner (4 Go de RAM chacun) qui
tournent en **Docker Compose**, sans orchestrateur. Chacun a un rôle bien distinct.

| VPS                         | Hostname             | Rôle                                                                          | Détail                     |
| --------------------------- | -------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| [Helsinki](./helsinki.md)   | `ubuntu-4gb-hel1-1`  | Applications DaVinciBot (site, admin, auth, formation...) en 3 environnements | `dev` / `staging` / `prod` |
| [Nuremberg](./nuremberg.md) | `ubuntu-4gb-nbg1-14` | Services tiers auto-hébergés, tunneling et monitoring                         | Un dossier par service     |

## Conventions communes {/*#conventions-communes*/}

- Tout est sous `/srv`, **un dossier par service** contenant son `docker-compose.yml` (ou `compose.yaml`) et son `.env`.
- Les fichiers `.env` ne sont **jamais** versionnés : chaque service fournit un `.env.example` ou se configure directement sur le serveur.
- Les conteneurs sont en `restart: unless-stopped`.
- Les conteneurs d'un même VPS se parlent via un **réseau Docker externe** partagé (`web` à Helsinki, `pangolin` à
  Nuremberg), créé une fois à la main.
- Les versions d'images sont **épinglées** (`image: foo:1.2.3`) pour les services tiers : on met à jour volontairement, jamais par surprise.
- Le monitoring des deux machines remonte dans le hub **Beszel** (`monitoring.davincibot.fr`), hébergé à Nuremberg.

## Procédures génériques {/*#procedures-generiques*/}

### Déployer un nouveau service {/*#deployer-un-nouveau-service*/}

```bash
cd /srv
mkdir -p mon-service && cd mon-service
# déposer docker-compose.yml et .env (cp .env.example .env puis remplir)
docker compose up -d
docker compose logs -f
```

Si le service doit être joignable via le réseau partagé et que celui-ci n'existe pas encore (nouvelle machine) :

```bash
docker network create web        # Helsinki
docker network create pangolin   # Nuremberg (créé par la stack Pangolin)
```

### Mettre à jour un service {/*#mettre-a-jour-un-service*/}

Pour un service à version épinglée :

```bash
cd /srv/mon-service
# 1. lire le changelog de l'éditeur (migrations, breaking changes)
# 2. changer le tag dans le compose
docker compose pull
docker compose up -d
docker compose logs -f --tail=100
```

Pour les applications DaVinciBot à Helsinki, la mise à jour est automatique (voir [Helsinki](./helsinki.md#watchtower)).

### Diagnostic rapide {/*#diagnostic-rapide*/}

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'   # état de tous les conteneurs
docker compose logs --tail=100 <service>             # logs d'un service
docker stats --no-stream                             # RAM / CPU (les VPS sont petits)
df -h && docker system df                            # disque
docker image prune -f                                # nettoyer les images orphelines
```

:::warning
Les VPS n'ont que 4 Go de RAM. Plusieurs services Nuremberg ont des limites mémoire (`mem_limit`) pour éviter qu'un
seul ne fasse tomber la machine : ne les retirez pas sans raison.
:::
