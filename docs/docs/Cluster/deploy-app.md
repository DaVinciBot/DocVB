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
