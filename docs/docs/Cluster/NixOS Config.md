# Configuration Cluster NixOS

Ce dépôt contient une configuration NixOS basée sur les flakes pour un cluster K3s avec un nœud maître et des nœuds workers.

## Structure

```
├── flake.nix                    # Configuration flake principale avec configuration serveur flexible
├── modules/                     # Modules NixOS réutilisables
│   ├── common.nix              # Configuration partagée (utilisateurs, paquets, etc.)
│   ├── server.nix              # Optimisations spécifiques aux serveurs
│   ├── nvidia.nix              # Configuration des pilotes NVIDIA
│   ├── k3s-master.nix          # Configuration du nœud maître K3s
│   ├── k3s-node.nix            # Configuration des nœuds workers K3s
│   └── tunnel.nix              # Configuration du service tunnel
├── secrets.nix.template        # Modèle pour la configuration sensible
├── secrets.nix                 # Secrets réels (NE PAS COMMITER DANS GIT)
└── hardware-configuration.nix   # Modèle de configuration matérielle - généré par NixOS
```

## Utilisation

### Configuration Initiale


2. **Créer secrets.nix** avec vos valeurs réelles basées sur le modèle :
   - `k3sToken` : Générer avec `openssl rand -base64 32`
   - `tunnel.id` et `tunnel.secret` : Vos identifiants de tunnel
   - `sshKeys` : Vos clés SSH publiques réelles
   - `userPasswords` : Générer avec `mkpasswd -m yescrypt`

3. **Initialiser le flake** :
   ```bash
   nix flake update
   ```

4. **Vérifier la configuration** :
   ```bash
   nix flake check
   ```

### Déploiement Local

Sur chaque machine cible, basculer vers la nouvelle configuration :
```bash
# Sur le nœud maître (flo)
sudo nixos-rebuild switch --flake .#flo

# Sur le nœud worker (ex : rob)
sudo nixos-rebuild switch --flake .#rob

```

### Mise à Jour

Pour mettre à jour des entrées spécifiques :
```bash
nix flake update nixpkgs
nix flake update nixpkgs-unstable
```

## Configuration

### Configuration Serveur Flexible

Le flake prend désormais en charge un système de configuration flexible utilisant la fonction `mkServerConfig` avec ces paramètres :

- **`serverHostname`** : Le nom d'hôte du serveur
- **`serverIP`** : L'adresse IP du serveur
- **`isMaster`** : Booléen - si vrai, devient maître K3s et active le service tunnel
- **`masterIP`** : Adresse IP du maître K3s (par défaut 192.168.0.10)

### Ajouter de Nouveaux Serveurs

Ajouter dans `flake.nix` dans la section `nixosConfigurations` :
```nix
nouveauserveur = mkServerConfig {
  serverHostname = "nouveauserveur";
  serverIP = "192.168.0.13";
  isMaster = false;
  masterIP = "192.168.0.10";
};
```

### Rôles des Serveurs

- **Nœuds maîtres** (`isMaster = true`) :
  - Exécutent K3s en mode serveur
  - Activent le service tunnel
  - Agissent comme plan de contrôle du cluster

- **Nœuds workers** (`isMaster = false`) :
  - Exécutent K3s en mode agent
  - Se connectent au maître spécifié
  - Fournissent des ressources de calcul

### Modifier les Modules

La structure modulaire permet une personnalisation facile :

- **common.nix** : Configuration partagée entre tous les hôtes
- **server.nix** : Optimisations spécifiques aux serveurs (headless, watchdog, etc.)
- **nvidia.nix** : Configuration des pilotes NVIDIA et CUDA
- **k3s-master.nix** : Configuration du nœud maître K3s
- **k3s-node.nix** : Configuration des nœuds workers K3s
- **tunnel.nix** : Service tunnel personnalisé

### Sécurité

- **Gestion des Secrets** : Les données sensibles sont stockées dans `secrets.nix` (exclu de git)
- **Authentification SSH** : L'authentification par mot de passe est désactivée, uniquement par clés
- **Utilisateurs Immuables** : Les utilisateurs sont immuables par défaut pour la sécurité
- **Configuration Firewall** : Règles de pare-feu appropriées pour la communication du cluster K3s
- **Mots de Passe Chiffrés** : Les mots de passe utilisateur sont stockés sous forme de hachages sécurisés

#### Gestion des Secrets

La configuration utilise un fichier `secrets.nix` pour stocker les informations sensibles :

- **Jeton de cluster K3s** : Secret partagé pour l'authentification du cluster
- **Clés SSH publiques** : Clés d'authentification utilisateur
- **Identifiants de tunnel** : Configuration du tunnel de service
- **Hachages de mots de passe** : Stockage sécurisé des mots de passe utilisateur

**Important** : Ne jamais commiter `secrets.nix` dans le contrôle de version !

## Informations du Cluster

- **Nœud Maître** : flo (192.168.0.10)
- **Nœud Worker** : rob et bob (192.168.0.11 et 192.168.0.12)
- **API K3s** : api.kube (192.168.0.10:6443)
- **Réseau** : 192.168.0.0/24
- **Passerelle** : 192.168.0.1

## Démarrage Rapide

1. **Cloner** :
   ```bash
   git clone <ce-depot>
   cd ClusterConfig
   ```

2. **Éditer les secrets** :
   ```bash
   # Générer un jeton K3s fort
   openssl rand -base64 32
   
   # Éditer secrets.nix avec vos valeurs réelles
   cp secrets.nix.template secrets.nix
   nano secrets.nix
   ```

4. **Déployer** :
   ```bash
   # Copier vers le serveur cible
   scp -r . dvb@192.168.0.15:/home/dvb/ClusterConfig
   
   # Déployer sur la cible
   ssh dvb@192.168.0.15 'cd ClusterConfig && sudo nixos-rebuild switch --flake .#nouveauworker'
   ```

## Notes de Sécurité Importantes

- 🔒 **Ne jamais commiter `secrets.nix` dans git**
- 🔑 Générer des jetons forts : `openssl rand -base64 32`
- 🛡️ Utiliser une gestion appropriée des clés SSH
- 🔐 Stocker des hachages de mots de passe, pas du texte brut : `mkpasswd -m yescrypt`