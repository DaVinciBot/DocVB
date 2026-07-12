# Améliorations proposées pour la documentation

Ce document liste les améliorations à apporter à la doc DaVinciBot, sur le fond
(contenu) comme sur la forme (structure, outillage, cohérence). Les points sont
classés par priorité indicative : 🔴 important, 🟠 souhaitable, 🟢 confort.

## Fond (contenu)

### 🔴 Compléter les pages incomplètes ou placeholder

- `cdr/paris/elek/power-delivery.md` : les sections « Schéma système » et
  « Protections et sécurité » sont vides (anciennement `doc needed` / `lol`,
  désormais marquées « À documenter »). La nomenclature contient encore des
  valeurs à trous (`[réf]`, `largeur min X mm`) et le plan de test n'a pas de
  résultats mesurés.
- `docs/mini-projects/open-weight/pcb.md` : page réduite à un « WIP » — publier
  les fichiers de conception annoncés ou dépublier la page en attendant
  (`draft: true`).
- `cdr/nantes/info/architecture/schemas.md` : marqué « À refaire » par l'équipe
  elle-même ; les diagrammes Mermaid décrivent une architecture abandonnée
  (Teensy Capteur) — regénérer les schémas depuis l'état réel du code.
- `docs/tutorials/pcb-design/pcb-design.md` : le plan annonce 11 chapitres
  (principes fondamentaux, outils, processus de conception, routage avancé,
  thermique, DFM, tests…) mais seuls le glossaire, les bonnes pratiques EMC et
  les bibliothèques KiCad existent. Écrire les chapitres manquants ou réduire
  le plan à ce qui existe.

### 🟠 Homogénéiser la langue

- `docs/mini-projects/cluster/deploy-app.md` est intégralement en anglais alors
  que tout le reste du site est en français. À traduire.
- Uniformiser les anglicismes : « features » vs « fonctionnalités »,
  « Getting started » vs « Guide de démarrage », etc.

### 🟠 Enrichir les contenus opérationnels

- `deploy-app.md` : expliquer *où* vivent les `values.yaml`, comment gérer les
  secrets Helm, et que faire quand un déploiement échoue (rollback).
- Cluster : aucune page ne documente la sauvegarde/restauration ni la
  supervision (New Relic / Uptime Kuma sont cités mais pas documentés).
- `cdr/nantes/info/getting_started.md` : ajouter une section dépannage
  (erreurs fréquentes port série, permissions udev, etc.).
- Les TODO listes (caméra, power-delivery) gagneraient à être suivies dans des
  issues GitHub liées plutôt que dans la doc, qui vieillit mal.

### 🟢 Divers

- `docs/tutorials/intro.md` : « Contacter l'équipe via discord » —
  donner un lien d'invitation ou un canal précis.
- Les captures d'écran de `matrix-chat.md` devront être refaites à chaque
  évolution de Cinny ; indiquer la version illustrée.

## Forme (structure, conventions, outillage)

### 🔴 Conventions de nommage restantes

Les fichiers en majuscules/espaces ont été renommés (`BRANCHES.md`,
`NixOS Config.md`, `PCB Design/`…), mais il reste un mélange
`snake_case`/`kebab-case` : `getting_started.md`, `setup_info.md`,
`communication_usb.md`, `env_docker_full.mdx`, `find_footprint.md`,
`ajouter_bibliotheques_kicad.md`, `best_practices.md`. Uniformiser en
kebab-case. ⚠️ Ces renommages changent les URL : les faire avec
`@docusaurus/plugin-client-redirects` pour ne pas casser les liens externes.

### 🔴 Appliquer le guide de rédaction partout

`docs/tutorials/_GUIDELINES.md` définit un excellent modèle (frontmatter,
structure Introduction → Prérequis → Contenu → Ressources, admonitions), mais :

- il n'est appliqué qu'aux tutoriels — l'étendre aux docs CDR et mini-projets ;
- beaucoup de pages n'ont pas de `last_update` (date + auteur) ;
- le déplacer/le lier depuis un `CONTRIBUTING.md` à la racine pour qu'il soit
  visible des nouveaux contributeurs.

### 🟠 Outillage qualité

- Ajouter `markdownlint` (ou Prettier + `prettier-plugin-*`) et un job CI qui
  lint la doc à chaque PR : on a corrigé à la main des titres setext, des
  blocs de code sans langage, des listes mal numérotées — un linter les
  attrapera automatiquement.
- Passer `onBrokenMarkdownLinks` de `"warn"` à `"throw"` dans
  `docusaurus.config.ts` une fois les liens assainis.
- Les alertes GitHub (`> [!NOTE]`) ne sont pas rendues par Docusaurus — elles
  ont été converties en admonitions `:::`, mais un lint CI éviterait leur
  réapparition.
- L'admonition personnalisée `:::exercise` (utilisée dans le parcours LaTeX)
  doit être déclarée dans la config `admonitions.keywords` pour être stylée ;
  sinon la remplacer par `:::tip Exercice`.

### 🟠 tags.yml unique

Chaque instance de docs (docs/, cdr/paris, cdr/nantes, versions archivées)
exige son propre `tags.yml` : le fichier est actuellement dupliqué 4 fois.
Ajouter un petit script (`npm run sync-tags`) ou un hook de build qui copie
`docs/tags.yml` vers les autres instances pour garantir qu'ils ne divergent pas.

### 🟠 Métadonnées et navigation

- Ajouter `sidebar_position` aux pages qui n'en ont pas (l'ordre par défaut est
  alphabétique, ce qui casse la progression logique — ex. modules Nantes).
- Renseigner `last_update` sur toutes les pages (le thème l'affiche déjà).
- Envisager `draft: true` pour les pages non prêtes plutôt que des bannières
  « WIP ».

### 🟢 Divers (forme)

- `i18n/` ne contient que `fr` alors que c'est la locale par défaut : soit
  supprimer le dossier, soit préparer une vraie locale `en`.
- Les images sont stockées tantôt dans `./img/`, tantôt dans `./images/`,
  tantôt dans `static/` : choisir une convention.
- Ajouter une page 404 personnalisée et un favicon à jour si ce n'est pas fait.
