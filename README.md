# DocVB

Sources de [docs.davincibot.fr](https://docs.davincibot.fr), la documentation de DaVinciBot : mini-projets, parcours de
formation et documentation de passation des équipes de la Coupe de France de robotique (CDR), à Paris et à Nantes.

Le site est construit avec [Docusaurus](https://docusaurus.io) 3 et déployé sur GitHub Pages à chaque push sur `main`.

## Contenu

Le site réunit trois instances de docs Docusaurus, chacune avec sa barre latérale générée depuis l'arborescence des
fichiers :

| Dossier      | Instance (`id`)            | URL                                | Navbar                           | Contenu                                                                                                                                |
| ------------ | -------------------------- | ---------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/`      | `default` (preset classic) | `/mini-projects/…`, `/tutorials/…` | « Minis-projets », « Formation » | `mini-projects/` (cluster, infra, open-weight, contribuer aux sites) et `tutorials/` (info, pcb-design, prise en main des outils, ROS) |
| `cdr/paris`  | `cdr-paris`                | `/cdr/paris/…`                     | « CDR Paris »                    | passation par sous-projet : `pami/`, `robot-principal/`, `calcul-deporte/`, `transverse/`                                              |
| `cdr/nantes` | `cdr-nantes`               | `/cdr/nantes/…`                    | « CDR Nantes »                   | `Info/`, `elek/`, `mecanique/`, `formation/`                                                                                           |

Les deux docs CDR sont **versionnées par saison** :

- `cdr/paris` est la saison en cours, « 2025/2026 », servie sous `/cdr/paris/2026` avec la bannière `unreleased`
  de Docusaurus. La saison « 2024/2025 » est archivée dans `cdr-paris_versioned_docs/version-2025/` (barre latérale dans
  `cdr-paris_versioned_sidebars/`, liste dans `cdr-paris_versions.json`) et servie sous `/cdr/paris/2025`.
- `cdr/nantes` n'a encore que la saison en cours, « 2025/2026 », sous `/cdr/nantes/2026`.

Un menu de version par instance CDR est affiché à droite de la navbar.

Le reste du dépôt :

```
docusaurus.config.ts   configuration du site, des trois instances et des versions
sidebars/              main.ts (docs/), cdr.ts (partagé par les deux instances CDR)
src/pages/             page d'accueil (index.tsx) et /licences
src/components/        composants MDX (DownloadButton, DownloadGroup, TutorialShowcase…)
src/theme/             composants Docusaurus surchargés (Navbar, DocItem, DocSidebar, pages de tags…)
src/plugins/           dvb-tags-data.ts : données des pages de tags
src/css/               custom.css, tags.css
static/img/            images, rangées selon le chemin du document qui les utilise
static/files/          fichiers téléchargeables, servis sous /files/…
i18n/fr/               libellés traduits du thème et des instances
```

Côté rendu : diagrammes Mermaid, formules KaTeX (`remark-math` / `rehype-katex`), Tailwind CSS v4 via PostCSS, icônes
`lucide-react`, recherche locale (`@easyops-cn/docusaurus-search-local`, raccourci `Ctrl`/`⌘` + `K`) et date de
dernière mise à jour sur chaque page. Les statistiques de visite (Rybbit auto-hébergé, sans cookie) ne sont chargées
qu'en build de production.

## Développement local

Prérequis : Node.js ≥ 18 (la CI utilise Node 22) et pnpm, dont la version est épinglée par `packageManager` dans
`package.json`.

```sh
pnpm install
pnpm start        # serveur de dev avec rechargement à chaud
```

### Commandes

| Commande                  | Effet                                           |
| ------------------------- | ----------------------------------------------- |
| `pnpm start`              | serveur de développement                        |
| `pnpm build`              | build statique dans `build/`                    |
| `pnpm serve`              | sert le contenu de `build/` en local            |
| `pnpm clear`              | vide les caches Docusaurus (`.docusaurus/`…)    |
| `pnpm typecheck`          | vérification TypeScript (`tsc`)                 |
| `pnpm write-translations` | régénère les fichiers de libellés de `i18n/fr/` |
| `pnpm write-heading-ids`  | ajoute des ancres explicites aux titres         |

La recherche locale n'indexe le contenu qu'au build : pour la tester, `pnpm build && pnpm serve`.

`onBrokenLinks` vaut `throw` : un lien interne cassé fait échouer le build, donc le déploiement. Les liens Markdown
cassés ne lèvent pour l'instant qu'un avertissement.

### Langue

Le site est en français uniquement : `fr` est la locale par défaut et la seule déclarée. `i18n/fr/` ne contient que les
libellés du thème (navbar, footer, `code.json`) et des instances de docs, pas de traduction du contenu.

## Déploiement

[`.github/workflows/doc.yml`](.github/workflows/doc.yml) tourne à chaque push sur `main` (et à la main via
`workflow_dispatch`) : `pnpm install --frozen-lockfile`, `pnpm run build`, puis publication du dossier `build/` sur
GitHub Pages (environnement `github-pages`). Le site est servi sous `https://docs.davincibot.fr`, à la racine
(`baseUrl: "/"`).

Il n'y a rien à lancer à la main : le script `deploy` de Docusaurus (poussée sur une branche `gh-pages`) n'est pas
utilisé. Attention d'ailleurs, `pnpm deploy` est une commande intégrée à pnpm, sans rapport avec ce script.

## Contribuer

Chaque page a un lien « Modifier cette page » qui ouvre le fichier sur GitHub. Pour une contribution plus large, créer
une branche, vérifier `pnpm build` en local, puis ouvrir une PR vers `main` : le merge déclenche le déploiement.

Conventions de rédaction :

- [`docs/tutorials/_GUIDELINES.md`](docs/tutorials/_GUIDELINES.md) — le guide de rédaction : frontmatter complet
  (`title`, `description`, `sidebar_position`, `tags`, `last_update`, `additional_contributors`), structure
  Introduction → Prérequis → Contenu → Ressources, convention de tags (type, technologie, domaine), admonitions `:::`,
  images dans `static/img/` selon le chemin du document et référencées par `/img/…`.
- [`cdr/paris/_template.md`](cdr/paris/_template.md) — le gabarit de passation CDR : les cinq pages attendues par
  sous-projet, noms de fichiers en `kebab-case` sans accent, ancres explicites sur les titres `##`.
- Les fichiers préfixés par `_` ne sont pas publiés.
- Chaque instance a son propre `tags.yml` (`docs/`, `cdr/paris/`, `cdr/nantes/`, et la version archivée) : un tag
  utilisé dans une page doit être déclaré dans le `tags.yml` de son instance.

Archiver une saison CDR en fin d'année :

```sh
pnpm run docusaurus docs:version:cdr-paris <année>    # ou docs:version:cdr-nantes
```

puis déclarer la nouvelle version (libellé, chemin) dans `versions` de `docusaurus.config.ts`. Les images ne sont **pas** recopiées par cette commande : les
dupliquer à la main et corriger les liens de la version archivée (voir l'avertissement « Versions archivées » du guide
de rédaction).

[`AMELIORATIONS.md`](AMELIORATIONS.md) liste les chantiers ouverts, sur le fond (pages incomplètes, langue, contenus
opérationnels) comme sur la forme (nommage, guide de rédaction, outillage qualité, `tags.yml`, métadonnées). C'est le
bon point de départ pour qui veut aider.

## À faire

- `cdr/nantes/` contient à la fois `Info/` (les pages) et `info/` (un `_category_.json` seul). Sur un système de
  fichiers insensible à la casse (macOS, Windows), les deux dossiers se confondent : à fusionner, en gérant le
  changement d'URL.
- Le reste est suivi dans [`AMELIORATIONS.md`](AMELIORATIONS.md).
