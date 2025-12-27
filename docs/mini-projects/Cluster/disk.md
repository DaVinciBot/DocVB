# Configuration des disques

## reformatage des disques

Pour reformater les disques, vous pouvez utiliser la commande suivante :

```bash
sudo mkfs.ext4 /dev/sdX
```

Remplacez `/dev/sdX` par le nom de votre disque. Vous pouvez trouver le nom de votre disque en utilisant la commande `lsblk`.

## Montage des disques

Pour monter un disque, vous pouvez utiliser la commande suivante :

```bash
sudo mount /dev/sdX /mnt
```

Remplacez `/dev/sdX` par le nom de votre disque et `/mnt` par le point de montage souhaité.

## Automatiser le montage des disques

Pour automatiser le montage des disques au démarrage, vous devez ajouter une entrée dans la config nix.
Veuillez vous référer à [cette page](/docs/mini-projects/Cluster/NixOS%20Config.md)
