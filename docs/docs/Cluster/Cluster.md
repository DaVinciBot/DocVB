Le cluster k3s de DaVinciBot est une manière d'économiser du budget sur les services en ligne en self-hostant des applications. Cela permet de réduire les coûts tout en gardant un contrôle total sur l'infrastructure.

Certains services, comme le SMTP, sont gérés en externe pour des raisons de sécurité et de fiabilité.

### Services auto-hébergés

Voici une liste des services auto-hébergés sur le cluster k3s de DaVinciBot :

- [**Stirling PDF**](https://pdf.davincibot.fr) : Application de génération de PDF.
- [**Vaultwarden**](https://vault.davincibot.fr) : Gestionnaire de mots de passe auto-hébergé.
- [**Rallly**](https://rallly.davincibot.fr) : Outil de planification d'événements.
- [**MinIO**](https://s3.davincibot.fr) : Stockage S3 compatible. (WIP)
- [**Overleaf**](https://latex.davincibot.fr) : Éditeur de documents LaTeX collaboratif. (WIP)
- [**Docuseal**](https://sign.davincibot.fr) : Solution de signature électronique. (WIP)

### Services externes

- **SMTP** : Service de messagerie mail. Géré par AWS SES
- **DocVB** : Documentation de DaVinciBot. Hébergée sur github pages
- **Pangolin** : Outil de fowarding et de tunneling. Hébergé sur un VPS Hetzner
- **DNS** : Service de nom de domaine, acheté sur OVH, géré par Netlify
- **davincibot.fr** : hébergement du site web de DaVinciBot. Géré par Netlify