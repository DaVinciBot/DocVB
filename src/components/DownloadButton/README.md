# Composants de Téléchargement

Ces composants permettent d'ajouter des boutons de téléchargement stylisés dans vos fichiers MDX.

## DownloadButton

Composant pour créer un bouton de téléchargement individuel.

### Props

- `href` (string, requis) : URL du fichier à télécharger
- `children` (ReactNode, requis) : Texte du bouton
- `variant` (string, optionnel) : Style du bouton - `'primary'` (défaut) ou `'secondary'`
- `size` (string, optionnel) : Taille du bouton - `'sm'`, `'md'`, ou `'lg'` (défaut)
- `icon` (string, optionnel) : Emoji ou icône à afficher avant le texte

### Exemple d'utilisation

```mdx
import DownloadButton from '@site/src/components/DownloadButton';

<DownloadButton href="https://example.com/file.zip" icon="📦">
  Télécharger le fichier
</DownloadButton>

<DownloadButton
  href="https://example.com/doc.pdf"
  variant="secondary"
  size="md"
  icon="📄"
>
  Documentation PDF
</DownloadButton>
```

## DownloadGroup

Composant pour regrouper plusieurs boutons de téléchargement dans une section stylisée.

### Props

- `children` (ReactNode, requis) : Boutons de téléchargement à afficher
- `title` (string, optionnel) : Titre de la section

### Exemple d'utilisation

```mdx
import DownloadButton from '@site/src/components/DownloadButton';
import DownloadGroup from '@site/src/components/DownloadGroup';

<DownloadGroup title="Ressources disponibles">
  <DownloadButton href="https://example.com/app.zip" icon="📦">
    Application
  </DownloadButton>
  <DownloadButton href="https://example.com/data.zip" variant="secondary" icon="💾">
    Données d'exemple
  </DownloadButton>
  <DownloadButton href="https://example.com/doc.pdf" variant="secondary" icon="📄">
    Documentation
  </DownloadButton>
</DownloadGroup>
```

## Fonctionnalités

- ✅ Design responsive (s'adapte aux mobiles)
- ✅ Animation au survol
- ✅ Support des icônes/emojis
- ✅ Thème clair/sombre automatique
- ✅ Accessibilité (liens externes avec rel="noopener noreferrer")
- ✅ Styles cohérents avec Docusaurus

## Variantes de boutons

### Primary (Bleu)

Utilisé pour les fichiers principaux ou importants.

### Secondary (Gris)

Utilisé pour les fichiers secondaires ou optionnels.

## Responsive

Sur mobile (< 768px), les boutons prennent toute la largeur disponible et se placent en colonne automatiquement.
