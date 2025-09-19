# Comment ajouter des bibliothèques

Cette formation pas-à-pas couvre comment trouver, installer et gérer des bibliothèques de symboles (schéma) et d'empreintes (PCB) dans KiCad 9.0, au niveau global et au niveau projet.

## 1. Concepts clés

- Bibliothèques de symboles: fichiers `.kicad_sym` (ou dossiers contenant ces fichiers). Gérées via le « Gestionnaire de bibliothèques de symboles » (Schématique).
- Bibliothèques d’empreintes: dossiers `.pretty` (chaque pad est un `.kicad_mod`). Gérées via le « Gestionnaire de bibliothèques d’empreintes » (PCB).
- Portée:
  - Globales: disponibles dans tous les projets de l'utilisateur.
  - Projet: visibles uniquement dans le projet courant (référencées dans `sym-lib-table` / `fp-lib-table` du projet).
- Variables de chemin: KiCad utilise des variables (`${KICAD6_...}`, `${KIPRJMOD}`, etc.). Préférez `${KIPRJMOD}` pour référencer des bibliothèques stockées dans le dépôt du projet.

## 2. Où trouver des bibliothèques fiables

- Officielles KiCad (intégrées / installables via PCM): large couverture de symboles et footprints.
- Plateformes tierces:
  - SnapEDA, Ultra Librarian, ComponentSearchEngine, Octopart: symboles + footprints téléchargeables.
  - GitHub/GitLab: dépôts `.pretty` (empreintes) et `.kicad_sym` (symboles). Ex.: bibliothèques fournisseurs (Molex, TE, Würth…).
- Fabricants: de plus en plus publient des librairies KiCad ou STEP 3D.

Bonnes pratiques: privilégier sources officielles/fournisseurs, vérifier dimensions dans la datasheet, et conserver une copie versionnée dans votre repo.

## 3. Installer via le PCM (KiCad Package Manager)

Le PCM permet d’installer des bibliothèques approuvées.

1) Ouvrir KiCad (vue Projet) > `Outils` > `Gestionnaire de paquets` (PCM).
2) Parcourir `Bibliothèques` et `Plugins`. Rechercher par mots-clés (ex.: "connector", "Würth").
3) Cliquer sur `Installer`. Le PCM gère le chemin et l’enregistrement automatique.
4) Vérifier dans les gestionnaires de bibliothèques que la ou les libs sont listées.

Avantages: mise à jour centralisée et vérifiée. Inconvénient: catalogue limité aux sources supportées.

## 4. Ajouter une bibliothèque depuis des fichiers locaux (projet ou disque)

Scénario A — Bibliothèques de symboles `.kicad_sym`:

1) Ouvrir l'éditeur de schéma (Eeschema) > `Préférences` > `Gestionnaire de bibliothèques de symboles`.
2) Choisir l’onglet `Projet` (recommandé) ou `Global` selon la portée souhaitée.
3) Cliquer `+` (Ajouter) > `Parcourir…` et sélectionner le fichier `.kicad_sym`.
4) Définir un `Préfixe/Lib nickname` clair (ex.: `Vendor_Connectors`).
5) Si le fichier est dans le dépôt, utilisez un chemin relatif via `${KIPRJMOD}/libs/Vendor_Connectors.kicad_sym`.
6) `Appliquer` puis `OK`.

Scénario B — Bibliothèques d’empreintes `.pretty`:

1) Ouvrir l'éditeur PCB (Pcbnew) > `Préférences` > `Gestionnaire de bibliothèques d’empreintes`.
2) Onglet `Projet` (recommandé) ou `Global`.
3) `+` (Ajouter) > type `KiCad` et pointer vers le dossier se terminant par `.pretty`.
4) Nommer la librairie (ex.: `MyBoards_Passives`), valider.
5) Préférez un chemin relatif: `${KIPRJMOD}/libs/footprints/MyBoards_Passives.pretty`.

Organisation projet recommandée:

```text
project/
  libs/
    symbols/
      Vendor_Connectors.kicad_sym
    footprints/
      MyBoards_Passives.pretty/
        R_0603.kicad_mod
  3dmodels/
    Vendor_Connectors/
      CONN_XXXX.step
```

## 5. Ajouter une bibliothèque depuis un dépôt Git (lecture seule ou clone)

Option 1 — Télécharger une archive `.zip` du repo:


- Décompressez dans `libs/` puis suivez la section 4.

Option 2 — Cloner en sous-module Git (fortement recommandé pour partager):

- Dans votre repo, ajoutez en sous-module:

```bash
git submodule add https://github.com/vendor/repo.pretty libs/footprints/repo.pretty
```

- Référencez la librairie via `${KIPRJMOD}/libs/footprints/repo.pretty`.
- Avantage: versionnage stable, reproductibilité pour l’équipe/CI.

## 6. Associer symboles ↔ empreintes et modèles 3D

- Association dans le schéma: dans Eeschema, utiliser le `Gestionnaire d’associations d’empreintes` pour mapper chaque symbole à une empreinte.
- Au niveau empreinte: ouvrir l’`Éditeur d’empreintes`, vérifier pads, couches et origin. Dans l’onglet `Modèle 3D`, ajouter un `.step` via un chemin relatif `${KIPRJMOD}/3dmodels/...`.
- Sauvegarder dans la librairie d’empreintes projet plutôt que dans les libs globales.

## 7. Variables de chemin utiles

- `${KIPRJMOD}`: racine du projet courant. Utilisez-le pour des chemins portables.
- `${KICAD_USER_TEMPLATE_DIR}`, `${KICAD6_FOOTPRINT_DIR}`, `${KICAD_SYMBOL_DIR}`: chemins d’installation/médias (selon système et version). Dans KiCad 9, ces variables existent encore, mais privilégiez `${KIPRJMOD}` pour les libs de projet.
- Gérer les variables via `Préférences` > `Configurer les chemins`.

## 8. Vérifications et dépannage

- Bibliothèque invisible: vérifiez portée (Projet vs Global) et ordre dans le gestionnaire. Assurez-vous que le chemin pointe vers un `.kicad_sym` (symboles) ou un dossier `.pretty` (empreintes).
- Symboles/empreintes non trouvés: mettez à jour l’index (`Recharger les librairies`) et contrôlez les droits sur le dossier.
- Empreinte décalée sur le PCB: vérifiez l’origine du composant et l’orientation par rapport à la datasheet.
- Conflits de noms: renommez les `nicknames` pour éviter les collisions.
- Modèles 3D manquants: validez les chemins relatifs, vérifiez l’échelle (1.0) et l’axe Z.

## 9. Bonnes pratiques d'équipe et CI/CD

- Versionnez toujours vos bibliothèques de projet dans le même dépôt (ou en sous-modules).
- Effectuez une revue lors de l’ajout d’une nouvelle empreinte (dimensions, pad stacks, clearances). Ajoutez un lien vers la datasheet dans la description.
- Figez les versions PCM utilisées (capture d’écran/liste) si vous dépendez de packages installés.
- Sur CI/CD, lancez un DRC/ERC et, si possible, un script `kicad-cli sch export`/`pcb export` pour vérifier que les libs se chargent (optionnel selon pipeline).

## 10. Raccourcis d’utilisation

- Recherche rapide de symboles: `A` dans l’éditeur de schéma pour "Ajouter un symbole" puis tapez votre terme.
- Recherche d’empreintes: dans l’éditeur d’empreintes, utilisez le navigateur d’empreintes et filtrez par librairie.
- Réutilisation: exportez/importez des champs personnalisés de symboles (références, MPN, LCSC, etc.).

## 11. Checklist finale

- [ ] Les bibliothèques nécessaires sont listées dans `sym-lib-table` (symboles) et `fp-lib-table` (empreintes) du projet.
- [ ] Les chemins utilisent `${KIPRJMOD}` et pointent vers `libs/` dans le repo.
- [ ] Les symboles sont associés à des empreintes correctes et les modèles 3D s’affichent.
- [ ] Un README `libs/README.md` documente l’origine des bibliothèques.

## Annexes

- Format symboles: `.kicad_sym` (texte YAML-like). Format empreintes: `.kicad_mod` dans dossier `.pretty`.
- Export/Import librairies: via gestionnaires respectifs ou `kicad-cli`.
- Références utiles: documentation officielle KiCad 9 et forum KiCad pour meilleures pratiques.
