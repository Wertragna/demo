[Connecting to Private CloudSQL from Cloud Run](https://codelabs.developers.google.com/connecting-to-private-cloudsql-from-cloud-run#0)

```shell
export PROJECT_ID=$(gcloud config get-value project)
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
export PROJECT_NAME=$(gcloud projects describe $PROJECT_ID --format='value(name)')
export REGION=us-east1
export SERVERLESS_VPC_CONNECTOR=cymbalconnector

```

```shell
export DB_INSTANCE_NAME=demo-catalog
export DB_INSTANCE_PASSWORD=magic123
export DB_DATABASE=demo-db
export DB_USER=admin
export DB_PASSWORD=magic
```

Configure Private Access:

```shell
gcloud services enable \
    sqladmin.googleapis.com \
    run.googleapis.com \
    vpcaccess.googleapis.com \
    servicenetworking.googleapis.com

gcloud compute addresses create google-managed-services-default \
    --global \
    --purpose=VPC_PEERING \
    --prefix-length=20 \
    --network=projects/$PROJECT_ID/global/networks/default

gcloud services vpc-peerings connect \
    --service=servicenetworking.googleapis.com \
    --ranges=google-managed-services-default \
    --network=default \
    --project=$PROJECT_ID
```

SQL postgres:

```shell
gcloud sql instances create $DB_INSTANCE_NAME \
    --project=$PROJECT_ID \
    --network=projects/$PROJECT_ID/global/networks/default \
    --no-assign-ip \
    --database-version=POSTGRES_15 \
    --cpu=2 \
    --memory=4GB \
    --region=$REGION \
    --root-password=${DB_INSTANCE_PASSWORD}
```

```shell
gcloud sql databases create $DB_DATABASE --instance=$DB_INSTANCE_NAME

gcloud sql users create ${DB_USER} \
    --password=$DB_PASSWORD \
    --instance=$DB_INSTANCE_NAME
```

Serverless VPC:

```shell
gcloud projects add-iam-policy-binding $PROJECT_ID \
--member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
--role="roles/cloudsql.client"

gcloud compute networks vpc-access connectors create ${SERVERLESS_VPC_CONNECTOR} \
    --region=${REGION} \
    --range=10.8.0.0/28
```

```shell
export DB_INSTANCE_IP=$(gcloud sql instances describe $DB_INSTANCE_NAME \
    --format=json | jq \
    --raw-output ".ipAddresses[].ipAddress")
```

build and deploy:

```shell
./mvnw install -DskipTests

```

```shell
export IMAGE_TAG=demo

gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_TAG .
```

```shell
export URL_SERVICE_NAME=demo
export CLOUD_RUN_SERVICE_NAME=demo-service
export PORT=8082


gcloud run deploy $CLOUD_RUN_SERVICE_NAME \
    --image=gcr.io/$PROJECT_ID/demo:latest \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars DB_USER=$DB_USER \
    --set-env-vars DB_PASS=$DB_PASSWORD \
    --set-env-vars DB_DATABASE=$DB_DATABASE \
    --set-env-vars DB_HOST=$DB_INSTANCE_IP \
    --port=$PORT \
    --vpc-connector $SERVERLESS_VPC_CONNECTOR \
    --project=$PROJECT_ID \
    --quiet
```


