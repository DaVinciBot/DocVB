# How to deploy all the dvb cluster apps

You must be on the master node, currently `flo` - 192.168.0.10, as it is the only node with helm installed.

## Stirling PDF

To deploy the Stirling PDF application on your K3s cluster, follow these steps:

```bash
cd /home/dvb/stirling
helm install my-stirling-pdf-chart stirling-pdf/stirling-pdf-chart --version 1.10.00
k3s kubectl apply -f pdf-nodeport.yaml
```

## Vaultwarden

To deploy the Vaultwarden (bitwarden backend but in rust) application on your K3s cluster, follow these steps:

if not already done, install the bjw-s-charts repository:

```bash
helm repo add bjw-s https://bjw-s-labs.github.io/helm-charts
helm repo update
```

Then, deploy Vaultwarden with the following commands:

```bash
cd /home/dvb/vaultwarden
    helm install vaultwarden bjw-s-charts/app-template -f values.yaml
k3s kubectl apply -f vault-nodeport.yaml
```

## Rallly

To deploy the Rallly application on your K3s cluster, follow these steps:

if not already done, update the repos

```bash
cd /home/dvb
helm dependency update ./rallly
```

Then, deploy Rallly with the following commands:

```bash
cd /home/dvb/rallly
helm install rallly ./rallly
```

If you need to change settings in the helm chart, edit the `values.yaml` file in the Rallly directory, then apply it like this:

```bash
cd /home/dvb
helm upgrade rallly ./rallly -f rallly/values.yaml
```

## Matrix Tuwunel

To deploy the Matrix Tuwunel application on your K3s cluster, follow these steps:

```bash
cd /home/dvb/tuwunel
helm upgrade matrix -f tuwunel-helm/values.yaml ./tuwunel-helm/ -n matrix
```

## Garage - S3 Storage

WIP

## ListMonk - Newsletter manager

To deploy the ListMonk application on your K3s cluster, follow these steps:

```bash
helm upgrade listmonk listmonk   --create-namespace   --install   --namespace listmonk   --repo https://th0th.github.io/helm-charts   --values values.yaml
k3s kubectl apply -f listmonk-nodeport.yaml
```

## Dockploy - Deployment manager

To deploy the Dockploy application on your K3s cluster, follow these steps:

```bash
helm install dockploy ./dockploy --create-namespace --namespace dockploy
---
