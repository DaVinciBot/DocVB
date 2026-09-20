# Gabarit de documentation de passation — CDR Paris

> Ce fichier est préfixé par `_` : il n'est **pas** publié comme page du site, il sert uniquement de
> référence aux contributeur·ice·s.

Chaque sous-projet (PAMIs, calcul déporté, robot principal, et tout nouveau sous-projet) se
documente avec **les mêmes cinq pages**, au même endroit. Pour démarrer un nouveau sous-projet,
copier l'arborescence d'un sous-projet existant et vider les pages.

## Où va quoi {/* #ou-va-quoi */}

```text
cdr/paris/<sous-projet>/
├── _category_.json           libellé et position dans la navigation
├── index.md                  sections 1, 2, 6 et 7 ci-dessous
├── info/
│   ├── modules.md            section 3
│   ├── etat-des-lieux.md     section 4
│   ├── debug.md              section 5
│   └── a-transmettre.md      section 8
├── elek/                     si le sous-projet a ses propres cartes
└── tutos/                    procédures propres à ce sous-projet et à cette saison
```

Si `modules.md` dépasse six modules copieux, il devient un dossier `info/modules/` avec un `index.md`
et un fichier par module.

## Conventions de rédaction {/* #conventions */}

- Noms de fichiers en `kebab-case`, sans accent.
- Frontmatter complet : `title`, `description`, `sidebar_label`, `sidebar_position`, `tags`, et
  `additional_contributors` pour créditer les auteurs. Voir `docs/tutorials/_GUIDELINES.md`.
- Ancres explicites sur les titres `##` : `## Mon titre {#mon-ancre}`. Elles gardent les liens
  valides même si le titre est reformulé.
- Images dans `static/img/cdr/paris/<sous-projet>/…`, référencées par `/img/cdr/paris/…`.
- Un tutoriel qui sera encore vrai l'an prochain avec du matériel différent va dans
  `docs/tutorials/`, pas ici.

---

**Contenu attendu, section par section.** Le titre de chaque section indique le fichier de
destination.

## 1. Objectif de la sous-équipe → `index.md` {/* #section-1 */}

Décrire en quelques paragraphes le rôle de cette sous-équipe dans la CDR.

À expliquer :

- quel problème cette partie résout
- à quoi elle sert pendant un match
- avec quelles autres parties elle interagit
- ce qu'un nouveau membre doit comprendre en premier

## 2. Vision globale de l'architecture → `index.md` {/* #section-2 */}

Présenter le fonctionnement général du projet.

À inclure :

- les principaux modules logiciels
- les composants matériels concernés
- les interactions entre code et hardware
- qui appelle quoi
- dans quel ordre les éléments sont lancés
- pourquoi l'architecture actuelle existe

L'objectif n'est pas d'expliquer chaque ligne de code, mais de permettre à quelqu'un de comprendre
comment le système fonctionne dans son ensemble.

## 3. Modules principaux → `info/modules.md` {/* #section-3 */}

Pour chaque module important :

### [Nom du module]

- Rôle du module :
- Pourquoi il existe :
- Entrées :
- Sorties :
- Modules ou composants avec lesquels il communique :
- État actuel :
- Limites connues :
- Points à améliorer :

## 4. État des lieux → `info/etat-des-lieux.md` {/* #section-4 */}

### Ce qui fonctionne

- ...

### Ce qui fonctionne partiellement

- ...

### Ce qui ne fonctionne pas encore

- ...

### Ce qui a été tenté mais abandonné

- ...

## 5. Débug et problèmes fréquents → `info/debug.md` {/* #section-5 */}

Lister les problèmes rencontrés pendant l'année et expliquer comment les diagnostiquer ou les
corriger. Pour chaque problème :

### [Nom du problème]

- Symptômes :
- Causes probables :
- Comment vérifier :
- Solution ou contournement :
- Fichiers/modules concernés :
- Remarques :

## 6. Choix techniques et erreurs historiques → `index.md` {/* #section-6 */}

Expliquer les décisions importantes prises pendant l'année.

À inclure si pertinent :

- pourquoi cette architecture a été choisie
- quelles alternatives ont été envisagées
- ce qu'il ne faut pas refaire
- les erreurs qui ont coûté du temps
- les choix qui ont bien fonctionné
- les compromis acceptés

## 7. Roadmap et vision pour l'année prochaine → `index.md` {/* #section-7 */}

Cette partie est optionnelle mais fortement recommandée.

À préciser :

- objectifs techniques prioritaires
- choix d'architecture à conserver
- choix d'architecture à revoir
- dette technique importante
- fonctionnalités à finir
- fonctionnalités à repenser
- ordre de priorité conseillé

## 8. Informations à transmettre → `info/a-transmettre.md` {/* #section-8 */}

Tout ce que vous voulez transmettre et qui **n'entre dans aucune des rubriques précédentes** :
conseils, notions mal comprises cette année, contexte utile, pièges d'organisation, ce que vous
auriez aimé qu'on vous dise en arrivant.

Ce n'est pas une liste de documentation à écrire : c'est de l'information de passation à part
entière. Même une seule phrase utile vaut mieux qu'une page vide.
