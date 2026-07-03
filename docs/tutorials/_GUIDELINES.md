# Guide de rédaction des tutoriels

Ce document définit la structure et les conventions à suivre pour rédiger un tutoriel
sur la documentation DaVinciBot. L'objectif est de garder une documentation **cohérente,
accessible et pédagogique** d'un tutoriel à l'autre.

> Ce fichier est préfixé par `_` : il n'est **pas** publié comme page du site, il sert
> uniquement de référence aux contributeur·ice·s.

## Philosophie

- **Accessible** : langage clair, progression logique du simple vers le complexe.
- **Pratique** : exemples concrets et exercices applicables.
- **Complet** : du prérequis à la mise en pratique, sans trou dans le raisonnement.
- **Cohérent** : même structure et mêmes conventions partout.

## Structure obligatoire

Chaque tutoriel doit suivre cet ordre :

1. **Frontmatter** — métadonnées complètes (voir ci-dessous).
2. **Introduction** — répondre à trois questions : *Quoi ? Pourquoi ? Quels objectifs ?*
3. **Prérequis & Installation** — ce qu'il faut savoir/installer avant de commencer.
4. **Contenu principal** — les sections propres au sujet.
5. **Ressources** — liens externes utiles, triés par pertinence.

Sections optionnelles (si elles apportent de la valeur) : *Exercices pratiques*,
*Bonnes pratiques*, *Erreurs courantes*, *Aller plus loin*.

## Frontmatter

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

## Convention de tags

Toujours combiner, dans cet ordre de granularité :

- **Type** : `info`, `electronique`, `mecanique`, `sysadmin`…
- **Technologie** : `docker`, `git`, `latex`, `python`…
- **Domaine** : `web`, `data`, `devops`, `securite`…

## Titres de section

Les titres `##` (H2) servent de **séparateurs de section** : ils affichent
automatiquement une bordure colorée. Le premier H2 sous l'en-tête de page n'a pas de
bordure (comportement géré par le CSS, rien à faire).

Pour ajouter une icône à un titre, importer une icône [Lucide](https://lucide.dev) :

```mdx
import { Package } from "lucide-react";

## <Package /> Prérequis
```

## Admonitions

Utiliser les blocs d'avertissement Docusaurus selon le contexte :

- `:::note` — clarification.
- `:::tip` — conseil pratique.
- `:::info` — information générale.
- `:::warning` — risque ou point d'attention.
- `:::danger` — point critique.

## Exemples de code

- Noms de variables explicites.
- Commentaires utiles (pas redondants).
- Exemples autonomes et exécutables.
- Sortie attendue indiquée en commentaire quand c'est pertinent.

## Ressources

Ordre de priorité des liens :

1. Documentation officielle.
2. Tutoriels de référence.
3. Aide-mémoire (*cheat sheets*).
4. Contenus vidéo.
5. Outils / extensions.
