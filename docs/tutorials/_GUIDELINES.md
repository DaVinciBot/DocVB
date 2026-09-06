# Guide de rédaction des tutoriels

Ce document définit la structure et les conventions à suivre pour rédiger un tutoriel
sur la documentation DaVinciBot. L'objectif est de garder une documentation **cohérente,
accessible et pédagogique** d'un tutoriel à l'autre.

> Ce fichier est préfixé par `_` : il n'est **pas** publié comme page du site, il sert
> uniquement de référence aux contributeur·ice·s.

## Philosophie {/*#philosophie*/}

- **Accessible** : langage clair, progression logique du simple vers le complexe.
- **Pratique** : exemples concrets et exercices applicables.
- **Complet** : du prérequis à la mise en pratique, sans trou dans le raisonnement.
- **Cohérent** : même structure et mêmes conventions partout.

## Structure obligatoire {/*#structure-obligatoire*/}

Chaque tutoriel doit suivre cet ordre :

1. **Frontmatter** — métadonnées complètes (voir ci-dessous).
2. **Introduction** — répondre à trois questions : *Quoi ? Pourquoi ? Quels objectifs ?*
3. **Prérequis & Installation** — ce qu'il faut savoir/installer avant de commencer.
4. **Contenu principal** — les sections propres au sujet.
5. **Ressources** — liens externes utiles, triés par pertinence.

Sections optionnelles (si elles apportent de la valeur) : *Exercices pratiques*,
*Bonnes pratiques*, *Erreurs courantes*, *Aller plus loin*.

## Frontmatter {/*#frontmatter*/}

Modèle complet à copier en tête de fichier :

```yaml
---
title: Titre du tutoriel
description: Une à deux phrases décrivant le contenu (utile pour le SEO).
sidebar_position: 1
tags: [info, docker, devops]
last_update:
  date: 2025-10-21
  author: Prénom Nom
additional_contributors:
  - username: Nom Affiché
    html_url: https://github.com/handle
    avatar_url: https://github.com/handle.png
---
```

- `additional_contributors` alimente le bloc **Contributeur·ice·s** affiché en bas de page.
  C'est une déclaration manuelle (pas de récupération automatique via GitHub).
- Pour masquer ce bloc sur une page, ajouter `show_contributors: false`.

## Convention de tags {/*#convention-de-tags*/}

Toujours combiner, dans cet ordre de granularité :

- **Type** : `info`, `electronique`, `mecanique`, `sysadmin`…
- **Technologie** : `docker`, `git`, `latex`, `python`…
- **Domaine** : `web`, `data`, `devops`, `securite`…

## Titres de section {/*#titres-de-section*/}

Les titres `##` (H2) servent de **séparateurs de section** : ils affichent
automatiquement une bordure colorée. Le premier H2 sous l'en-tête de page n'a pas de
bordure (comportement géré par le CSS, rien à faire).

Pour ajouter une icône à un titre, importer une icône [Lucide](https://lucide.dev) :

```mdx
import { Package } from "lucide-react";

## <Package /> Prérequis
```

## Admonitions {/*#admonitions*/}

Utiliser les blocs d'avertissement Docusaurus selon le contexte :

- `:::note` — clarification.
- `:::tip` — conseil pratique.
- `:::info` — information générale.
- `:::warning` — risque ou point d'attention.
- `:::danger` — point critique.

## Images {/*#images*/}

Toutes les images du site sont centralisées dans `static/img/`. On ne place **jamais**
d'image à côté d'un fichier `.md` : `static/` est copié tel quel à la racine du site, donc
un fichier `static/img/…` est servi à l'URL `/img/…`.

L'arborescence sous `static/img/` **reflète le chemin du document** qui utilise l'image :

| Document                                       | Dossier d'images                                 |
| ---------------------------------------------- | ------------------------------------------------ |
| `docs/tutorials/info/unity.md`                 | `static/img/tutorials/info/unity/`               |
| `docs/tutorials/prise-en-main-des-outils/*.md` | `static/img/tutorials/prise-en-main-des-outils/` |
| `cdr/paris/elek/*.md`                          | `static/img/cdr/paris/elek/`                     |
| `cdr/nantes/*.md`                              | `static/img/cdr/nantes/`                         |

La racine `static/img/` est réservée aux éléments d'identité du site (logo, favicon,
image Open Graph) : ne rien y déposer d'autre.

La référence se fait toujours par un **chemin absolu** commençant par `/img/` :

```md
![Texte alternatif décrivant l'image](/img/tutorials/info/unity/01-unity-hub.png)
_Légende affichée sous l'image._
```

- Nommer les fichiers en minuscules, sans espace ni accent (`kebab-case`). Pour une série
  qui suit l'ordre du tutoriel, préfixer par un numéro : `01-…`, `02-…`.
- Le texte alternatif décrit **ce que montre** l'image (il sert aux lecteurs d'écran) ;
  la légende en italique, sur la ligne suivante, apporte le commentaire.
- Les fichiers téléchargeables (archives, PDF) suivent la même logique dans
  `static/files/`, référencés par `/files/…`.

:::warning Versions archivées
Les images d'une doc CDR versionnée ne sont **pas** recopiées par
`pnpm run docusaurus docs:version:<plugin> <année>`. Après avoir créé une version,
dupliquer à la main le dossier d'images vers `static/img/cdr/<équipe>-<année>/` et
corriger les liens dans le dossier `*_versioned_docs`, sinon l'archive affichera les
images de la saison en cours.
:::

## Exemples de code {/*#exemples-de-code*/}

- Noms de variables explicites.
- Commentaires utiles (pas redondants).
- Exemples autonomes et exécutables.
- Sortie attendue indiquée en commentaire quand c'est pertinent.

## Ressources {/*#ressources*/}

Ordre de priorité des liens :

1. Documentation officielle.
2. Tutoriels de référence.
3. Aide-mémoire (*cheat sheets*).
4. Contenus vidéo.
5. Outils / extensions.
