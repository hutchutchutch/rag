#!/bin/bash
set -e

# Check for required environment variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
  echo "Error: AWS_ACCOUNT_ID and AWS_REGION must be set"
  exit 1
fi

# Set variables
ECR_REPOSITORY_NAME="rag-guide"
ECR_REPOSITORY_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME"
BACKEND_IMAGE_TAG="backend-$(date +%Y%m%d-%H%M%S)"
FRONTEND_IMAGE_TAG="frontend-$(date +%Y%m%d-%H%M%S)"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Create ECR repository if it doesn't exist
echo "Checking if ECR repository exists..."
if ! aws ecr describe-repositories --repository-names "$ECR_REPOSITORY_NAME" >/dev/null 2>&1; then
  echo "Creating ECR repository..."
  aws ecr create-repository --repository-name "$ECR_REPOSITORY_NAME"
fi

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build and push backend
echo "Building backend image..."
cd "$PROJECT_ROOT"
docker build -t "$ECR_REPOSITORY_URI:$BACKEND_IMAGE_TAG" -t "$ECR_REPOSITORY_URI:backend-latest" -f apps/backend/Dockerfile.prod .

echo "Pushing backend image..."
docker push "$ECR_REPOSITORY_URI:$BACKEND_IMAGE_TAG"
docker push "$ECR_REPOSITORY_URI:backend-latest"

# Build and push frontend
echo "Building frontend image..."
cd "$PROJECT_ROOT"
docker build -t "$ECR_REPOSITORY_URI:$FRONTEND_IMAGE_TAG" -t "$ECR_REPOSITORY_URI:frontend-latest" -f apps/frontend/Dockerfile.prod .

echo "Pushing frontend image..."
docker push "$ECR_REPOSITORY_URI:$FRONTEND_IMAGE_TAG"
docker push "$ECR_REPOSITORY_URI:frontend-latest"

# Update task definitions with the new image URI
echo "Updating task definitions..."
cd "$PROJECT_ROOT/infra/aws/ecs"

# Replace placeholders in task definition
sed -e "s|\${ECR_REPOSITORY_URI}|$ECR_REPOSITORY_URI|g" \
    -e "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" \
    -e "s|\${NEO4J_URI}|$NEO4J_URI|g" \
    -e "s|\${POSTGRES_HOST}|$POSTGRES_HOST|g" \
    backend-task-definition.json > backend-task-definition-updated.json

sed -e "s|\${ECR_REPOSITORY_URI}|$ECR_REPOSITORY_URI|g" \
    -e "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" \
    -e "s|\${BACKEND_API_URL}|$BACKEND_API_URL|g" \
    frontend-task-definition.json > frontend-task-definition-updated.json

# Register task definitions
echo "Registering task definitions..."
BACKEND_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://backend-task-definition-updated.json --query 'taskDefinition.taskDefinitionArn' --output text)
FRONTEND_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://frontend-task-definition-updated.json --query 'taskDefinition.taskDefinitionArn' --output text)

echo "Backend task definition registered: $BACKEND_TASK_DEF_ARN"
echo "Frontend task definition registered: $FRONTEND_TASK_DEF_ARN"

# Update services if they exist
if aws ecs describe-services --cluster rag-guide-cluster --services rag-guide-backend-service --query 'services[0]' >/dev/null 2>&1; then
  echo "Updating backend service..."
  aws ecs update-service --cluster rag-guide-cluster --service rag-guide-backend-service --task-definition "$BACKEND_TASK_DEF_ARN" --force-new-deployment
else
  echo "Backend service doesn't exist. Please create it first."
fi

if aws ecs describe-services --cluster rag-guide-cluster --services rag-guide-frontend-service --query 'services[0]' >/dev/null 2>&1; then
  echo "Updating frontend service..."
  aws ecs update-service --cluster rag-guide-cluster --service rag-guide-frontend-service --task-definition "$FRONTEND_TASK_DEF_ARN" --force-new-deployment
else
  echo "Frontend service doesn't exist. Please create it first."
fi

echo "Deployment completed successfully!"