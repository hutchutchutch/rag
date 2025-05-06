#!/bin/bash
set -e

# Load environment variables if .env exists
if [ -f .env ]; then
  source .env
fi

# Check for required environment variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
  echo "Error: AWS_ACCOUNT_ID and AWS_REGION must be set in .env file"
  exit 1
fi

# Step 1: Create the ECR repository
echo "==== Creating ECR Repository ===="
ECR_REPOSITORY_NAME="rag-guide"
ECR_REPOSITORY_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME"

if ! aws ecr describe-repositories --repository-names "$ECR_REPOSITORY_NAME" >/dev/null 2>&1; then
  echo "Creating ECR repository..."
  aws ecr create-repository --repository-name "$ECR_REPOSITORY_NAME"
fi

# Step 2: Build and push the Docker images
echo "==== Building and Pushing Docker Images ===="
# Get ECR login token
aws ecr get-login-password | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build and push backend
echo "Building backend image..."
cd $(dirname "$0")/../..
BACKEND_IMAGE_TAG="backend-$(date +%Y%m%d-%H%M%S)"
docker build -t "$ECR_REPOSITORY_URI:$BACKEND_IMAGE_TAG" -t "$ECR_REPOSITORY_URI:backend-latest" -f apps/backend/Dockerfile.prod .

echo "Pushing backend image..."
docker push "$ECR_REPOSITORY_URI:$BACKEND_IMAGE_TAG"
docker push "$ECR_REPOSITORY_URI:backend-latest"

# Build and push frontend
echo "Building frontend image..."
FRONTEND_IMAGE_TAG="frontend-$(date +%Y%m%d-%H%M%S)"
docker build -t "$ECR_REPOSITORY_URI:$FRONTEND_IMAGE_TAG" -t "$ECR_REPOSITORY_URI:frontend-latest" -f apps/frontend/Dockerfile.prod .

echo "Pushing frontend image..."
docker push "$ECR_REPOSITORY_URI:$FRONTEND_IMAGE_TAG"
docker push "$ECR_REPOSITORY_URI:frontend-latest"

cd $(dirname "$0")

# Step 3: Update task definition templates with actual values
echo "==== Updating Task Definitions ===="
cd ecs

# Replace placeholders in task definitions
sed -e "s|\${ECR_REPOSITORY_URI}|$ECR_REPOSITORY_URI|g" \
    -e "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" \
    -e "s|\${NEO4J_URI}|$NEO4J_URI|g" \
    -e "s|\${POSTGRES_HOST}|$POSTGRES_HOST|g" \
    backend-task-definition.json > backend-task-definition-updated.json

sed -e "s|\${ECR_REPOSITORY_URI}|$ECR_REPOSITORY_URI|g" \
    -e "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" \
    -e "s|\${BACKEND_API_URL}|$BACKEND_API_URL|g" \
    frontend-task-definition.json > frontend-task-definition-updated.json

# Step 4: Update service definition templates with actual values
sed -e "s|\${SUBNET_ID_1}|$PUBLIC_SUBNET_1_ID|g" \
    -e "s|\${SUBNET_ID_2}|$PUBLIC_SUBNET_2_ID|g" \
    -e "s|\${SECURITY_GROUP_ID}|$BACKEND_SG_ID|g" \
    -e "s|\${TARGET_GROUP_ARN}|$BACKEND_TG_ARN|g" \
    rag-guide-backend-service.json > rag-guide-backend-service-updated.json

sed -e "s|\${SUBNET_ID_1}|$PUBLIC_SUBNET_1_ID|g" \
    -e "s|\${SUBNET_ID_2}|$PUBLIC_SUBNET_2_ID|g" \
    -e "s|\${SECURITY_GROUP_ID}|$FRONTEND_SG_ID|g" \
    -e "s|\${TARGET_GROUP_ARN}|$FRONTEND_TG_ARN|g" \
    rag-guide-frontend-service.json > rag-guide-frontend-service-updated.json

# Step 5: Register task definitions
echo "==== Registering Task Definitions ===="
BACKEND_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://backend-task-definition-updated.json --query 'taskDefinition.taskDefinitionArn' --output text)
FRONTEND_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://frontend-task-definition-updated.json --query 'taskDefinition.taskDefinitionArn' --output text)

echo "Backend task definition registered: $BACKEND_TASK_DEF_ARN"
echo "Frontend task definition registered: $FRONTEND_TASK_DEF_ARN"

# Step 6: Create or update ECS services
echo "==== Creating/Updating ECS Services ===="
if aws ecs describe-services --cluster rag-guide-cluster --services rag-guide-backend-service --query 'services[0]' >/dev/null 2>&1; then
  echo "Updating backend service..."
  aws ecs update-service --cluster rag-guide-cluster --service rag-guide-backend-service --task-definition "$BACKEND_TASK_DEF_ARN" --force-new-deployment
else
  echo "Creating backend service..."
  aws ecs create-service --cli-input-json file://rag-guide-backend-service-updated.json
fi

if aws ecs describe-services --cluster rag-guide-cluster --services rag-guide-frontend-service --query 'services[0]' >/dev/null 2>&1; then
  echo "Updating frontend service..."
  aws ecs update-service --cluster rag-guide-cluster --service rag-guide-frontend-service --task-definition "$FRONTEND_TASK_DEF_ARN" --force-new-deployment
else
  echo "Creating frontend service..."
  aws ecs create-service --cli-input-json file://rag-guide-frontend-service-updated.json
fi

echo "==== Deployment Completed Successfully! ===="
echo "Load balancer URL: http://$(aws elbv2 describe-load-balancers --names rag-guide-alb --query 'LoadBalancers[0].DNSName' --output text)"