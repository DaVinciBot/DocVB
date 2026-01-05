# Cluster

Le cluster k3s de DaVinciBot est une manière d'économiser du budget sur les services en ligne en self-hostant des applications. Cela permet de réduire les coûts tout en gardant un contrôle total sur l'infrastructure. Il nous permet aussi de garantir la confidentialité de nos données, par exemple dans le cadre des NDA.

Certains services, comme le SMTP, sont gérés en externe pour des raisons de sécurité et de fiabilité.

### Services auto-hébergés

Voici une liste des services auto-hébergés sur le cluster k3s de DaVinciBot :

- [**Stirling PDF**](https://pdf.davincibot.fr) : Application de génération de PDF.
- [**Vaultwarden**](https://vault.davincibot.fr) : Gestionnaire de mots de passe auto-hébergé.
- [**Rallly**](https://rallly.davincibot.fr) : Outil de planification d'événements.
- [**Docuseal**](https://sign.davincibot.fr) : Solution de signature électronique.
- [**Matrix Tuwunel**](https://chat.davincibot.fr) : Serveur Matrix encrypté.
- [**New Relics**](https://newrelic.com) : Monitoring et logs.
- [**Garage**](https://s3.davincibot.fr) : Stockage S3 compatible. (WIP)
- [**ListMonk**](https://mail.davincibot.fr) : Outil d'emailing auto-hébergé.
- [**Overleaf**](https://tex.davincibot.fr) : Éditeur de documents LaTeX collaboratif. (sur un node séparé)
- [**Dockploy**](https://dockploy.davincibot.fr) : Gestionnaire de déploiement d'applications.

#### Sur le VPS Hetzner de Frankfurt

- [**Uptime Kuma**](https://uptime.davincibot.fr) : Outil de monitoring de services.
- [**Pangolin**](https://pangolin.davincibot.fr) : Outil de tunneling et de fowarding.
- [**Rybbit**](https://rybbit.com/) : Google analytics mais RPGD friendly.

#### Sur le VPS Hetzner de Helsinki

- [**davincibot.fr**](https://davincibot.fr) : Site web de DaVinciBot. Le site est décomposé en plusieurs sous partie, voir doc du site pour plus de détails.
- [**Supabase**](https://supa.davincibot.fr) : Base de données Postgres auto-hébergée - Test uniquement.

### Services externes

- **SMTP** : Service de messagerie mail. Géré par AWS SES
- **DocVB** : Documentation de DaVinciBot. Hébergée sur github pages
- **DNS** : Service de nom de domaine, acheté sur OVH
