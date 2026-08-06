---
title: Contribuer aux sites DaVinciBot
description: Mettre en place son environnement pour développer sur les repos web de DaVinciBot — rôle de chaque repo, PAT read:packages, authentification à GitHub Packages et export de NPM_TOKEN.
slug: how-to-contribute-to-dvbsites
tags: [info, svelte, web]
last_update:
  date: 2026-08-06
  author: Eliott A. Roussille
additional_contributors:
  - username: Eliott A. Roussille
    html_url: https://github.com/aust-1
    avatar_url: https://github.com/aust-1.png
---

import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import { Boxes, KeyRound, Package, Rocket, TriangleAlert } from "lucide-react";

Les sites de l'association (site public, panel admin, gestion des formations, service
d'authentification) partagent du code via des **packages npm privés** publiés sur
**GitHub Packages**. Tant que votre machine n'est pas authentifiée auprès de ce
registre, `pnpm install` échoue sur le scope `@davincibot/*` : c'est le seul vrai
piège de l'installation, et l'objet principal de ce tutoriel.

**Objectifs :**

- Comprendre à quoi sert chaque repo et lequel cloner.
- Installer Node et pnpm aux versions attendues.
- Générer un PAT `read:packages` et s'authentifier à GitHub Packages.
- Cloner un repo, l'installer et lancer le serveur de dev.

:::info Prérequis
Un compte GitHub **membre de l'organisation [DaVinciBot](https://github.com/DaVinciBot)**
(demandez l'invitation au pôle info), Git installé, et des bases en ligne de commande.
Les repos sont privés : sans l'invitation, ni le clone ni les packages ne fonctionneront.
:::

## <Boxes /> Les repos

Chaque dossier est un **repo git indépendant** (pas de submodules) : on en clone un seul
pour commencer, pas besoin de tout récupérer.

| Repo                                                                 | Rôle                                                                    | Port de dev |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- |
| [`davincibot.fr`](https://github.com/DaVinciBot/davincibot.fr)       | Le site public de l'association, servi à la racine `/`                  | 5174        |
| [`cash`](https://github.com/DaVinciBot/cash)                         | Le panel d'administration (finances, membres…), servi sous `/admin`     | 5175        |
| [`formation`](https://github.com/DaVinciBot/formation)               | L'application de gestion des formations, servie sous `/formation`       | 5176        |
| [`auth`](https://github.com/DaVinciBot/auth)                         | Le service d'authentification centralisé (`auth.davincibot.fr`)         | 5177        |
| [`packages`](https://github.com/DaVinciBot/packages)                 | Le workspace pnpm des packages partagés `@davincibot/*`                 | —           |
| [`Supabased`](https://github.com/DaVinciBot/Supabased)               | Le backend Supabase : schéma, migrations, edge functions, types générés | —           |
| [`shared-workflows`](https://github.com/DaVinciBot/shared-workflows) | Les workflows GitHub Actions réutilisables (CI, build de conteneurs)    | —           |

Les quatre applications sont en **SvelteKit + Svelte 5**. Elles ne gèrent jamais les
sessions elles-mêmes : tout ce qui touche au login passe par `auth`.

Les packages partagés consommés par les apps :

- **`@davincibot/config`** — configs ESLint, Prettier et TypeScript communes.
- **`@davincibot/lib`** — code partagé (client Supabase, helpers serveur, types).
- **`@davincibot/components`** — bibliothèque de composants Svelte 5.
- **`@davincibot/database-types`** — types TypeScript générés depuis la base (repo `Supabased`).

:::tip Par où commencer ?
Pour une première contribution, clonez **`davincibot.fr`** : c'est le repo le plus
autonome (il ne nécessite pas de lancer `auth` pour afficher les pages publiques).
:::

## <Package /> Installer Node et pnpm

Les repos épinglent leurs versions et **refusent de s'installer si elles ne correspondent
pas** (`engine-strict=true` et `package-manager-strict=true` dans le `.npmrc`) :

- **Node** : version indiquée dans le fichier `.nvmrc` du repo (actuellement `24.11.0`).
- **pnpm** : version indiquée par le champ `packageManager` du `package.json` (actuellement `11.5.2`).

Le plus simple est d'installer un gestionnaire de versions Node (`fnm` ou `nvm`), puis
d'activer **Corepack**, qui télécharge automatiquement la bonne version de pnpm quand
vous lancez une commande dans un repo.

Les instructions ci-dessous utilisent **`fnm`** : il s'installe et s'utilise de la même
façon sur les trois OS, et il bascule tout seul sur la version du `.nvmrc` quand vous
entrez dans un repo.

:::note Vous avez déjà nvm ?
Gardez-le, aucune raison de migrer. `nvm install && nvm use` lit le `.nvmrc` du repo
exactement comme `fnm`. Sous Windows, il s'agit de
[nvm-windows](https://github.com/coreybutler/nvm-windows), un projet distinct de
[nvm](https://github.com/nvm-sh/nvm) : les commandes sont proches mais la bascule
automatique au changement de dossier n'existe pas, il faut penser à faire `nvm use`
à la main. Passez directement à l'étape `corepack enable pnpm`.
:::

<Tabs groupId="os">
  <TabItem value="windows" label="Windows">
    Dans **PowerShell** :

    ```powershell
    # Gestionnaire de versions Node
    winget install Schniz.fnm

    # Redémarrez le terminal, puis, depuis le dossier du repo :
    fnm install 24.11.0
    fnm use 24.11.0

    # pnpm à la version épinglée par le repo
    corepack enable pnpm
    ```

    :::note Activer fnm automatiquement
    Pour que `fnm` bascule tout seul sur la version du `.nvmrc`, ajoutez cette ligne à
    votre profil PowerShell (`notepad $PROFILE`) :

    ```powershell
    fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
    ```
    :::

  </TabItem>
  <TabItem value="macos" label="macOS">
    Avec [Homebrew](https://brew.sh) :

    ```bash
    brew install fnm

    # Ajoutez à ~/.zshrc :
    eval "$(fnm env --use-on-cd --shell zsh)"

    # Rechargez le shell, puis, depuis le dossier du repo :
    fnm install 24.11.0
    fnm use 24.11.0

    corepack enable pnpm
    ```

  </TabItem>
  <TabItem value="linux" label="Linux">
    ```bash
    curl -fsSL https://fnm.vercel.app/install | bash

    # Ajoutez à ~/.bashrc (ou ~/.zshrc) :
    eval "$(fnm env --use-on-cd --shell bash)"

    # Rechargez le shell, puis, depuis le dossier du repo :
    fnm install 24.11.0
    fnm use 24.11.0

    corepack enable pnpm
    ```

  </TabItem>
</Tabs>

Vérifiez :

```bash
node --version   # v24.11.0
pnpm --version   # 11.5.2
```

:::warning Ne pas installer pnpm avec `npm i -g pnpm`
Vous vous retrouveriez avec une version figée qui finira par diverger du champ
`packageManager`, et `pnpm install` refuserait de tourner. Corepack suit
automatiquement la version demandée par chaque repo.
:::

## <KeyRound /> Générer un PAT `read:packages`

Les packages `@davincibot/*` sont **privés** : il faut un _Personal Access Token_ GitHub
pour les télécharger.

1. Allez sur [github.com/settings/tokens](https://github.com/settings/tokens) →
   **Tokens (classic)** → **Generate new token (classic)**.
2. **Note** : `DVB packages`, `npm-ghcr-read-packages` (ou ce que vous voulez).
3. **Expiration** : si vous ne voulez pas le régénérer régulièrement, choisissez **No expiration**.
4. **Scopes** : cochez uniquement **`read:packages`**. Rien d'autre n'est nécessaire pour installer les dépendances.
5. Cliquez sur **Generate token** et **copiez-le immédiatement** : GitHub ne le réaffichera plus jamais.

:::danger Token classique obligatoire
Le registre npm de GitHub Packages **ne fonctionne pas avec les tokens _fine-grained_**.
Prenez bien un token **classic**, sinon vous obtiendrez une erreur 401 sans explication.
:::

Le token est un **secret** : il ne se commit jamais, ne se colle pas dans un fichier du
repo, ne se partage pas. En cas de fuite, révoquez-le depuis la même page.

## <KeyRound /> S'authentifier auprès de GitHub Packages

Cette commande enregistre le token dans votre `.npmrc` **personnel** (dans votre dossier
utilisateur), en dehors de tout repo :

    ```bash
    npm login --registry=https://npm.pkg.github.com --auth-type=legacy
    ```

Trois informations vous sont demandées :

| Champ      | Valeur à saisir                           |
| ---------- | ----------------------------------------- |
| `Username` | votre pseudo GitHub, **en minuscules**    |
| `Password` | le **PAT** généré à l'étape précédente    |
| `Email`    | votre adresse e-mail (n'importe laquelle) |

:::note Pourquoi `--auth-type=legacy` ?
Par défaut, `npm login` ouvre un navigateur pour une authentification web que GitHub
Packages ne supporte pas. L'option `--auth-type=legacy` force la saisie
identifiant/mot de passe dans le terminal, seul mode accepté par ce registre.
:::

:::tip Le mot de passe ne s'affiche pas
C'est normal : rien ne s'affiche pendant que vous collez le token. Collez, puis
`Entrée`.
:::

Vérifiez que ça marche :

    ```bash
    npm whoami --registry=https://npm.pkg.github.com
    # doit afficher votre pseudo GitHub
    ```

## <KeyRound /> Exporter `NPM_TOKEN`

Le `.npmrc` versionné dans chaque repo lit le token depuis une **variable
d'environnement** :

    ```ini
    @davincibot:registry=https://npm.pkg.github.com/
    //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
    ```

Sans `NPM_TOKEN` défini, `pnpm install` échoue — même si `npm login` a réussi. Définissez
la variable **de façon permanente**, pas seulement dans le terminal courant :

<Tabs groupId="os">
  <TabItem value="windows" label="Windows">
    **PowerShell**, pour la session courante :

    ```powershell
    $env:NPM_TOKEN = "ghp_votre_token"
    ```

    Pour la rendre permanente (à faire une seule fois) :

    ```powershell
    setx NPM_TOKEN "ghp_votre_token"
    # ou
    [Environment]::SetEnvironmentVariable("NPM_TOKEN", "ghp_votre_token", "User")
    ```

    :::warning
    `setx` et `SetEnvironmentVariable` n'affectent **pas** le terminal déjà ouvert :
    fermez-le et rouvrez-en un nouveau (et redémarrez VS Code / votre IDE) pour que la
    variable soit visible.
    :::

  </TabItem>
  <TabItem value="macos" label="macOS">
    Ajoutez la ligne à la fin de `~/.zshrc` :

    ```bash
    export NPM_TOKEN="ghp_votre_token"
    ```

    Puis rechargez le shell :

    ```bash
    source ~/.zshrc
    ```

  </TabItem>
  <TabItem value="linux" label="Linux">
    Ajoutez la ligne à la fin de `~/.bashrc` (ou `~/.zshrc` selon votre shell) :

    ```bash
    export NPM_TOKEN="ghp_votre_token"
    ```

    Puis rechargez le shell :

    ```bash
    source ~/.bashrc
    ```

    Sous **fish** :

    ```fish
    set -Ux NPM_TOKEN ghp_votre_token
    ```

  </TabItem>
</Tabs>

Vérification finale, depuis n'importe quel dossier :

    ```bash
    pnpm whoami --registry=https://npm.pkg.github.com
    ```

:::note Et en CI ?
Les workflows GitHub Actions utilisent le secret d'organisation
`PACKAGES_READ_TOKEN` : vous n'avez rien à configurer côté CI.
:::

## <Rocket /> Cloner, installer, lancer

    ```bash
    git clone https://github.com/DaVinciBot/davincibot.fr.git
    cd davincibot.fr

    # Node à la version du .nvmrc (automatique si fnm --use-on-cd est configuré)
    fnm use

    cp .env.example .env   # PowerShell : Copy-Item .env.example .env

    pnpm install
    pnpm dev               # http://localhost:5174
    ```

Le fichier `.env.example` est documenté : renseignez les valeurs manquantes en demandant
les clés au pôle info. Les commandes utiles, identiques dans les quatre applications :

    ```bash
    pnpm dev          # serveur de développement
    pnpm build        # build de production
    pnpm check        # vérification des types (svelte-check)
    pnpm lint         # prettier + eslint
    pnpm format       # reformate le code
    pnpm test:unit    # tests unitaires (vitest)
    pnpm ci-workflow  # check + lint + test:unit + build, comme la CI
    ```

:::tip Lancer plusieurs sites à la fois
Depuis `davincibot.fr/`, `pnpm dev:all` démarre le site public, le panel admin et
l'app formation, chacun sur son port s'ils sont dans le même dossier parent. Le service
`auth` n'en fait pas partie : pour tester un parcours de connexion, lancez `pnpm dev`
depuis `auth/` (port 5177).
:::

Avant d'ouvrir une pull request, faites tourner `pnpm ci-workflow` : c'est exactement
ce que la CI exécutera.

## <TriangleAlert /> Dépannage

| Symptôme                                             | Cause probable et solution                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ERR_PNPM_FETCH_401` sur `@davincibot/…`             | `NPM_TOKEN` absent, mal orthographié ou expiré. Vérifiez avec `pnpm whoami --registry=https://npm.pkg.github.com`. |
| 401 alors que le token est bien défini               | Token _fine-grained_ au lieu de _classic_, ou SSO non autorisé pour l'organisation.                                |
| `404 Not Found` sur `@davincibot/…`                  | Vous n'êtes pas membre de l'organisation, ou le scope `read:packages` manque.                                      |
| La variable n'est pas vue sous Windows               | Terminal ouvert avant le `setx` : fermez-le et rouvrez-en un (VS Code compris).                                    |
| `ERR_PNPM_UNSUPPORTED_ENGINE`                        | Mauvaise version de Node : `fnm use` dans le repo pour suivre le `.nvmrc`.                                         |
| pnpm refuse de démarrer à cause de sa propre version | `corepack enable pnpm`, puis relancez la commande depuis le repo.                                                  |
| Svelte se plaint de « two instances »                | Arrive avec `pnpm link` : ajoutez `resolve.dedupe: ['svelte']` dans la config Vite de l'app.                       |

## Ressources

- [Working with the npm registry (GitHub Packages)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Créer un personal access token](https://docs.github.com/en/authentication/keeping-your-account-secure/managing-your-personal-access-tokens)
- [Documentation SvelteKit](https://svelte.dev/docs/kit)
- [Documentation Svelte 5](https://svelte.dev/docs/svelte)
- [Documentation pnpm](https://pnpm.io/motivation)
- [fnm — Fast Node Manager](https://github.com/Schniz/fnm)
- [nvm — Node Version Manager](https://www.nvmnode.com/fr/)
- [PostgreSQL](https://www.postgresql.org/docs/current/index.html)
- [Supabase](https://supabase.com/docs)
