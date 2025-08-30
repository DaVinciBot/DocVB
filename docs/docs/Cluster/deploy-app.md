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

## MinIO - S3 Storage

To deploy the MinIO application on your K3s cluster, follow these steps:

```bash
helm repo add minio-operator https://operator.min.io
helm repo update

helm install --namespace minio-operator --create-namespace operator minio-operator/operator --set service.type=NodePort --set service.nodePort=30090 --set console.service.type=NodePort --set console.service.nodePort=30091 --set console.enabled=true
```