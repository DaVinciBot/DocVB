---
title: VPS Helsinki
description: Services déployés sur le VPS Hetzner d'Helsinki — applications DaVinciBot en dev/staging/prod, reverse proxy Caddy, mises à jour automatiques via Watchtower.
sidebar_position: 2
tags: [sysadmin, docker, devops]
last_update:
  author: Eliott A. Roussille
  date: 2026-10-07
additional_contributors:
  - username: Eliott A. Roussille
    html_url: https://github.com/aust-1
    avatar_url: https://github.com/aust-1.png
---

Le VPS d'Helsinki héberge les **applications développées par DaVinciBot**. Chaque application existe en jusqu'à trois
environnements, et ses images sont construites et publiées sur `ghcr.io/davincibot/*` par la CI.

## Architecture {/*#architecture*/}

```text
Internet ──► Caddy (80/443) ──► réseau Docker "web" ──► conteneurs applicatifs
                                         ▲
Watchtower ── (API HTTP) ── pull ghcr.io ┘
```

Arborescence de `/srv` :

```text
/srv
├── proxy/              # Caddy (Caddyfile + compose)
├── watchtower/         # mises à jour automatiques
├── beszel-agent/       # agent de monitoring
├── admin/{dev,staging,prod}/
├── auth/{dev,staging,prod}/
├── formation/{dev,staging,prod}/
├── site/{dev,staging,prod}/
└── hook/{staging,prod}/
```

Chaque dossier d'environnement contient `docker-compose.yml`, `.env.example` et `.env`.

### Correspondance branche → environnement {/*#branche-environnement*/}

| Environnement | Tag d'image | Branche source |
| ------------- | ----------- | -------------- |
| `dev`         | `:dev`      | `dev`          |
| `staging`     | `:staging`  | `staging`      |
| `prod`        | `:main`     | `main`         |

## Services {/*#services*/}

| Service      | Dossier        | Image                                   | Rôle                                             | Envs               |
| ------------ | -------------- | --------------------------------------- | ------------------------------------------------ | ------------------ |
| Caddy        | `proxy`        | `caddy:2.11.4`                          | Reverse proxy HTTPS (certificats automatiques)   | unique             |
| Watchtower   | `watchtower`   | `nickfedor/watchtower:1.22.3`           | Met à jour les conteneurs quand une image change | unique             |
| Beszel agent | `beszel-agent` | `henrygd/beszel-agent:0.20.0`           | Remonte les métriques au hub Beszel              | unique             |
| Admin (cash) | `admin`        | `ghcr.io/davincibot/cash`               | Panneau d'administration / trésorerie            | dev, staging, prod |
| Auth         | `auth`         | `ghcr.io/davincibot/auth`               | Authentification centralisée                     | dev, staging, prod |
| Formation    | `formation`    | `ghcr.io/davincibot/formation`          | Application de formation                         | dev, staging, prod |
| Site         | `site`         | `ghcr.io/davincibot/davincibot.fr`      | Site web [davincibot.fr](https://davincibot.fr)  | dev, staging, prod |
| Hook         | `hook`         | `ghcr.io/davincibot/helloasso-webhooks` | Réception des webhooks HelloAsso                 | staging, prod      |

### Caddy {/*#caddy*/}

Seul point d'entrée : ports `80` et `443` publiés, le `Caddyfile` est monté en lecture seule et les certificats sont
conservés dans les volumes `caddy-data` / `caddy-config`. Les conteneurs applicatifs ne publient **aucun port** : Caddy
les joint par leur `container_name` sur le réseau `web` (par exemple `site-prod`).

Pour ajouter ou modifier un domaine, éditer `/srv/proxy/Caddyfile` puis recharger sans coupure :

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Watchtower {/*#watchtower*/}

Lancé avec `--http-api-update --label-enable --cleanup` :

- `--label-enable` : seuls les conteneurs portant le label `com.centurylinklabs.watchtower.enable=true` sont
  surveillés (tous les conteneurs applicatifs, sauf Watchtower lui-même).
- `--http-api-update` : pas de polling périodique, la mise à jour est **déclenchée à la demande** par un appel à l'API
  HTTP de Watchtower, authentifié par le token `WATCHTOWER_HTTP_API_TOKEN` de son `.env`. C'est ce que fait la CI
  (workflow `deploy.yml` de chaque dépôt) après avoir poussé une nouvelle image : le token doit être **identique** dans
  le `.env` de Watchtower et dans le secret GitHub du dépôt.
- `--cleanup` : supprime l'ancienne image après mise à jour.
- `docker-config/config.json` est monté en lecture seule : il contient les identifiants permettant de `pull` les images
  privées de `ghcr.io`.

Forcer une mise à jour à la main (remplacer `<TOKEN>` par `WATCHTOWER_HTTP_API_TOKEN`) :

```bash
curl -H "Authorization: Bearer <TOKEN>" http://watchtower:8080/v1/update   # depuis le réseau "web"
```

:::note
`8080` est le port par défaut de l'API Watchtower ; l'URL réellement appelée par la CI figure dans le `deploy.yml` du
dépôt concerné.
:::

### Applications (admin, auth, formation, site, hook) {/*#applications*/}

Toutes suivent le même modèle de compose : une image `ghcr.io/davincibot/<app>:<tag>`, un `env_file: .env`, le réseau
`web` et le label Watchtower.

Particularités :

- **Environnement `dev`** : monte `/var/lib/dvb/dev-rbac` dans `/data/dev-rbac`. Ce dossier héberge les profils du
  panneau RBAC de développement, **partagés par les quatre apps** (admin, auth, formation, site). Le conteneur tourne
  en UID 1000, donc :

  ```bash
  sudo mkdir -p /var/lib/dvb/dev-rbac
  sudo chown 1000:1000 /var/lib/dvb/dev-rbac
  ```

- **`hook`** n'existe qu'en `staging` et `prod` (pas de `dev`). Voir [sa configuration](#hook).

### Beszel agent {/*#beszel-agent*/}

Tourne en `network_mode: host` et lit le socket Docker en lecture seule. Il écoute sur le port `45876` et le hub
(`monitoring.davincibot.fr`, voir [Nuremberg](./nuremberg.md#beszel)) se connecte à lui. `BESZEL_AGENT_KEY` et
`BESZEL_AGENT_TOKEN` sont obligatoires dans le `.env` (le compose refuse de démarrer sans). Le dossier
`beszel_agent_data` contient l'empreinte (`fingerprint`) de la machine : ne pas le supprimer, sinon le hub devra
réapprouver l'agent.

## Configuration (`.env`) {/*#configuration*/}

Chaque dossier fournit un `.env.example` à copier en `.env`. Les valeurs marquées « secret » ne vont jamais dans git.

### Variables communes aux apps SvelteKit {/*#variables-communes*/}

`admin`, `auth`, `formation` et `site` partagent ce socle :

| Variable                          | Rôle                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`             | URL du projet Supabase                                                                          |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase (peut être exposée au client)                                             |
| `SUPABASE_SECRET_KEY`             | Clé `service_role` Supabase, **secret**, contourne la RLS                                       |
| `PUBLIC_AUTH_BASE_URL`            | URL du service `auth` de l'environnement (`auth.dev.`, `auth.staging.`, `auth.`)                |
| `PUBLIC_COOKIE_PREFIX`            | `dev-` / `staging-` / vide : isole les cookies d'un environnement qui partage le domaine racine |
| `ORIGIN`                          | URL publique de l'app (exigée par `adapter-node`)                                               |
| `ADDRESS_HEADER`, `XFF_DEPTH`     | `x-forwarded-for` et `1` : l'IP client est lue derrière **un** proxy (Caddy)                    |

Les domaines suivent le schéma `<app>.dev.davincibot.fr`, `<app>.staging.davincibot.fr` et `<app>.davincibot.fr`.

:::warning[Projets Supabase]
`dev` utilise son propre projet Supabase, mais **`staging` et `prod` pointent vers le même
projet** (sauf `hook` en staging, qui pointe vers le projet de dev). Toute écriture faite depuis staging touche donc
les données de prod : à garder en tête.
:::

### Auth {/*#auth*/}

Le service `auth` est le fournisseur d'identité central (OIDC, passkeys). Variables supplémentaires :

| Variable                                     | Rôle                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_ROOT_DOMAIN`                         | Domaine racine des cookies de session (`dev.davincibot.fr`, `staging.…`, `davincibot.fr`)                             |
| `PUBLIC_MAIN_SITE_URL`, `PUBLIC_AUTH_ORIGIN` | URL du site principal et origine publique du service auth                                                             |
| `SESSION_ENC_KEY`                            | Chiffre les tokens de session au repos (`openssl rand -base64 32`), **secret**. Vide = en clair                       |
| `SESSION_ENC_REQUIRED`                       | `1` : refuse de démarrer sans `SESSION_ENC_KEY`                                                                       |
| `STEP_UP_ENFORCE`                            | `1` : exige un step-up MFA (403 `elevation_required`) sur les actions sensibles                                       |
| `OIDC_PUBLIC_KEY_PEM`                        | Clé publique RSA servie sur `/.well-known/jwks.json` (la clé privée vit dans les secrets des edge functions Supabase) |
| `WEBAUTHN_RP_ID`                             | Domaine parent partagé pour les passkeys                                                                              |
| `WEBAUTHN_RP_NAME`                           | Nom affiché dans les prompts passkey                                                                                  |
| `WEBAUTHN_ORIGINS`                           | Origines autorisées (CSV) : auth **et** site admin                                                                    |

:::danger[Définitif]
`WEBAUTHN_RP_ID` ne doit jamais être modifié après mise en service : cela invalide toutes les passkeys enregistrées.
:::

Si l'enrôlement d'une passkey échoue avec « L'activation a échoué », l'origine de l'app (`admin`, `site`, ...) manque dans
`WEBAUTHN_ORIGINS`.

### Panneau RBAC de développement {/*#panneau-rbac*/}

Uniquement en `dev` (staging et prod répondent `404` quoi qu'on configure) :

| Variable                    | Rôle                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `DEV_RBAC_PANEL`            | `true` pour activer le panneau                                      |
| `DEV_RBAC_ALLOWED_USER_IDS` | UUID autorisés, séparés par des virgules (vide = personne)          |
| `DEV_RBAC_SNAPSHOTS_PATH`   | `/data/dev-rbac/snapshots.json`, sur le volume monté par le compose |

Il requiert aussi `SUPABASE_SECRET_KEY`. Voir plus haut pour le `chown` du dossier hôte.

### Hook {/*#hook*/}

Reçoit les notifications de paiement HelloAsso à l'adresse `https://hook.davincibot.fr/webhook/<WEBHOOK_SECRET>`. Ce
secret dans l'URL est **la seule authentification** (HelloAsso ne signe pas les notifications d'un compte association) :
minimum 24 caractères, à générer avec `openssl rand -hex 32`.

| Variable                                          | Rôle                                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `WEBHOOK_SECRET`                                  | Secret de l'URL du webhook, **secret**                                       |
| `HELLOASSO_CLIENT_ID`, `HELLOASSO_CLIENT_SECRET`  | Identifiants API (espace HelloAsso → « Mes clients API »), **secret**        |
| `HELLOASSO_API_BASE`, `HELLOASSO_TOKEN_URL`       | API de **production** ou **bac à sable** (staging)                           |
| `HELLOASSO_ORG_SLUG`, `HELLOASSO_ACCEPTED_STATES` | Organisation et statuts de paiement acceptés                                 |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`       | Idempotence des paiements et registre du WEI, **secret**                     |
| `ALERT_WEBHOOK_URL`                               | Salon Discord des incidents (donnée fautive). Vide = désactivé               |
| `HTTP_TIMEOUT_MS`, `PROCESS_TIMEOUT_MS`           | Délais (8 s / 12 s) ; le second doit rester sous la limite HelloAsso (~15 s) |

Deux handlers, chacun **activé par une variable** :

- **Cotisation** : activé par `NOTION_TOKEN`. Marque la cotisation payée dans une base Notion. Dès qu'il est défini,
  tout le bloc `NOTION_*` devient obligatoire (id de la source de données, noms exacts des propriétés email, statut,
  montant, prénom/nom, ...). Les libellés, accents compris, doivent correspondre au caractère près à ceux de Notion.
- **WEI** : activé par `WEI_DISCORD_WEBHOOK_URL`. Inscrit la place au registre et annonce l'arrivant sur Discord.
  `WEI_FORM_SLUG` est alors obligatoire ; `WEI_CAPACITY` (optionnel) affiche « 23 / 60 places ».

:::tip
En `staging`, `HELLOASSO_API_BASE` et `HELLOASSO_TOKEN_URL` pointent vers `api.helloasso-sandbox.com` ; en `prod` vers
`api.helloasso.com`. Vérifier ces deux variables en premier si les paiements de test n'arrivent pas.
:::

### Autres services {/*#autres-services*/}

- **Watchtower** : `WATCHTOWER_HTTP_API_TOKEN` (voir [Watchtower](#watchtower)).
- **Beszel agent** : `BESZEL_VERSION`, `BESZEL_AGENT_KEY`, `BESZEL_AGENT_TOKEN`, fournis par le hub à l'ajout de la machine.

## Déployer {/*#deployer*/}

### Nouvelle application ou nouvel environnement {/*#nouvelle-application*/}

```bash
cd /srv
mkdir -p <app>/<env> && cd <app>/<env>
# copier docker-compose.yml depuis un environnement existant, adapter name, container_name et le tag d'image
cp .env.example .env && nano .env
docker compose up -d
```

Puis :

1. Ajouter le domaine dans `/srv/proxy/Caddyfile` et recharger Caddy.
2. Vérifier que le label `com.centurylinklabs.watchtower.enable=true` est présent.
3. Vérifier que le workflow CI de l'application déclenche bien Watchtower.

### Déploiement courant {/*#deploiement-courant*/}

Rien à faire à la main : un push sur la branche (`dev`, `staging` ou `main`) construit l'image, la CI appelle
Watchtower, et le conteneur est recréé avec la nouvelle image.

## Maintenir {/*#maintenir*/}

| Tâche                        | Commande                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Voir l'état de tout          | `docker ps --format 'table {{.Names}}\t{{.Status}}'`                          |
| Logs d'une app               | `cd /srv/<app>/<env> && docker compose logs -f --tail=100`                    |
| Redémarrer une app           | `cd /srv/<app>/<env> && docker compose restart`                               |
| Rollback                     | retagger l'ancienne image (`docker tag`) ou redéployer un commit précédent    |
| Mettre à jour Caddy / Beszel | changer le tag dans le compose, `docker compose pull && docker compose up -d` |

:::warning[Rollback]
Watchtower suit le tag (`:main`) : si vous repartez sur une ancienne image à la main, la prochaine publication
l'écrasera. Pour un vrai retour arrière, corrigez le code et republiez.
:::

### Points de vigilance {/*#points-de-vigilance*/}

- Les `.env` ne sont **pas sauvegardés** hors du serveur : garder les valeurs dans le gestionnaire de mots de passe
  (Vaultwarden).
- `/var/lib/dvb/dev-rbac` est le seul état persistant des apps (hors bases externes) : à inclure dans une sauvegarde
  si on y tient.
