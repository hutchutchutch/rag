# RAG Guide AWS Deployment

This guide describes how to deploy the RAG Guide application to AWS using ECS, ECR, and other AWS services.

## Prerequisites

1. AWS CLI installed and configured
2. Docker installed locally
3. Appropriate AWS permissions for:
   - ECR: Create/push images
   - ECS: Create/manage clusters, services, task definitions
   - IAM: Create/manage roles and policies
   - Parameter Store: Create/manage parameters

## Infrastructure Setup

### 1. Set up Environment Variables

Create a `.env` file in the `infra/aws` directory:

```
export AWS_ACCOUNT_ID="your-aws-account-id"
export AWS_REGION="us-west-2"
export ECR_REPOSITORY_NAME="rag-guide"
export NEO4J_URI="bolt://your-neo4j-host:7687"
export POSTGRES_HOST="your-postgres-host"
export BACKEND_API_URL="https://api.yourdomain.com/api"
```

Source the file before running deployment scripts:

```bash
source .env
```

### 2. Create IAM Roles and Policies

#### Create Trust Policy First

The trust policy allows the ECS service to assume the role. The file is already created at `trust-policy.json`, but here's the command to create it again if needed:

```bash
cat > trust-policy.json << 'EOL'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOL
```

#### Create ECS Task Execution Role

This role allows ECS to pull container images and write logs:

```bash
# Check if the role already exists
aws iam get-role --role-name ecsTaskExecutionRole >/dev/null 2>&1 || \
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

# Attach the Amazon managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### Create Application-Specific Task Role

This role provides your application containers with permissions to access AWS resources:

```bash
# Check if the role already exists
aws iam get-role --role-name rag-guide-ecs-task-role >/dev/null 2>&1 || \
aws iam create-role \
  --role-name rag-guide-ecs-task-role \
  --assume-role-policy-document file://trust-policy.json

# Create the application policy
aws iam create-policy \
  --policy-name rag-guide-task-policy \
  --policy-document file://iam/rag-guide-task-role-policy.json \
  --description "Policy for RAG Guide ECS tasks to access S3, SSM and CloudWatch"

# Get the policy ARN (or construct it)
POLICY_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:policy/rag-guide-task-policy"

# Attach the policy to the role
aws iam attach-role-policy \
  --role-name rag-guide-ecs-task-role \
  --policy-arn "$POLICY_ARN"
```

### 3. Store Secrets in AWS Systems Manager Parameter Store

Using Parameter Store for secrets is more secure than hardcoding them in environment variables. Here's how to create the necessary parameters:

```bash
# Neo4j credentials
aws ssm put-parameter \
  --name "/rag-guide/neo4j/user" \
  --value "neo4j" \
  --type SecureString \
  --description "Neo4j username for RAG Guide application"

aws ssm put-parameter \
  --name "/rag-guide/neo4j/password" \
  --value "your-neo4j-password" \
  --type SecureString \
  --description "Neo4j password for RAG Guide application"

# PostgreSQL credentials
aws ssm put-parameter \
  --name "/rag-guide/postgres/user" \
  --value "postgres" \
  --type SecureString \
  --description "PostgreSQL username for RAG Guide application"

aws ssm put-parameter \
  --name "/rag-guide/postgres/password" \
  --value "your-postgres-password" \
  --type SecureString \
  --description "PostgreSQL password for RAG Guide application"

# API Keys
aws ssm put-parameter \
  --name "/rag-guide/google/api-key" \
  --value "your-google-api-key" \
  --type SecureString \
  --description "Google API key for Gemini embeddings"

aws ssm put-parameter \
  --name "/rag-guide/openai/api-key" \
  --value "your-openai-api-key" \
  --type SecureString \
  --description "OpenAI API key for RAG Guide application"
```

To verify your parameters have been created:

```bash
aws ssm get-parameters-by-path \
  --path "/rag-guide/" \
  --recursive \
  --with-decryption \
  --query "Parameters[*].{Name:Name}"
```

### 4. Create an ECS Cluster

The ECS cluster will host your containerized application:

```bash
# Create the ECS cluster
aws ecs create-cluster \
  --cluster-name rag-guide-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --tags key=Project,value=RAGGuide

# Verify the cluster was created
aws ecs describe-clusters \
  --clusters rag-guide-cluster \
  --query "clusters[0].status"
```

The output should be "ACTIVE" if the cluster was created successfully.

### 5. Create CloudWatch Log Groups for Container Logs

Create log groups for your containers:

```bash
# Create log group for backend
aws logs create-log-group \
  --log-group-name /ecs/rag-guide-backend \
  --tags Project=RAGGuide

# Create log group for frontend
aws logs create-log-group \
  --log-group-name /ecs/rag-guide-frontend \
  --tags Project=RAGGuide

# Set log retention (optional, 14 days in this example)
aws logs put-retention-policy \
  --log-group-name /ecs/rag-guide-backend \
  --retention-in-days 14

aws logs put-retention-policy \
  --log-group-name /ecs/rag-guide-frontend \
  --retention-in-days 14
```

### 6. Set Up Networking Infrastructure (VPC, Subnets, Security Groups)

For a production deployment, you need a proper networking setup. Here's how to create the necessary resources:

#### Create a VPC with Public and Private Subnets

```bash
# Create a VPC with a large CIDR block
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=rag-guide-vpc},{Key=Project,Value=RAGGuide}]' \
  --query 'Vpc.VpcId' \
  --output text)

echo "Created VPC: $VPC_ID"

# Enable DNS hostnames for the VPC
aws ec2 modify-vpc-attribute \
  --vpc-id $VPC_ID \
  --enable-dns-hostnames '{"Value":true}'

# Create an Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=rag-guide-igw},{Key=Project,Value=RAGGuide}]' \
  --query 'InternetGateway.InternetGatewayId' \
  --output text)

echo "Created Internet Gateway: $IGW_ID"

# Attach the Internet Gateway to the VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID

# Create public subnets in different Availability Zones
PUBLIC_SUBNET_1_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ${AWS_REGION}a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rag-guide-public-1},{Key=Project,Value=RAGGuide}]' \
  --query 'Subnet.SubnetId' \
  --output text)

PUBLIC_SUBNET_2_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone ${AWS_REGION}b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rag-guide-public-2},{Key=Project,Value=RAGGuide}]' \
  --query 'Subnet.SubnetId' \
  --output text)

echo "Created Public Subnets: $PUBLIC_SUBNET_1_ID, $PUBLIC_SUBNET_2_ID"

# Create private subnets in different Availability Zones
PRIVATE_SUBNET_1_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.3.0/24 \
  --availability-zone ${AWS_REGION}a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rag-guide-private-1},{Key=Project,Value=RAGGuide}]' \
  --query 'Subnet.SubnetId' \
  --output text)

PRIVATE_SUBNET_2_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.4.0/24 \
  --availability-zone ${AWS_REGION}b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rag-guide-private-2},{Key=Project,Value=RAGGuide}]' \
  --query 'Subnet.SubnetId' \
  --output text)

echo "Created Private Subnets: $PRIVATE_SUBNET_1_ID, $PRIVATE_SUBNET_2_ID"

# Create a route table for public subnets
PUBLIC_ROUTE_TABLE_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rag-guide-public-rt},{Key=Project,Value=RAGGuide}]' \
  --query 'RouteTable.RouteTableId' \
  --output text)

echo "Created Public Route Table: $PUBLIC_ROUTE_TABLE_ID"

# Create a route to the Internet Gateway
aws ec2 create-route \
  --route-table-id $PUBLIC_ROUTE_TABLE_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID

# Associate public subnets with the public route table
aws ec2 associate-route-table \
  --subnet-id $PUBLIC_SUBNET_1_ID \
  --route-table-id $PUBLIC_ROUTE_TABLE_ID

aws ec2 associate-route-table \
  --subnet-id $PUBLIC_SUBNET_2_ID \
  --route-table-id $PUBLIC_ROUTE_TABLE_ID

# Save the subnet IDs to environment variables
echo "export PUBLIC_SUBNET_1_ID=$PUBLIC_SUBNET_1_ID" >> .env
echo "export PUBLIC_SUBNET_2_ID=$PUBLIC_SUBNET_2_ID" >> .env
echo "export PRIVATE_SUBNET_1_ID=$PRIVATE_SUBNET_1_ID" >> .env
echo "export PRIVATE_SUBNET_2_ID=$PRIVATE_SUBNET_2_ID" >> .env
```

#### Create Security Groups

```bash
# Create a security group for the application load balancer
ALB_SG_ID=$(aws ec2 create-security-group \
  --group-name rag-guide-alb-sg \
  --description "Security group for RAG Guide application load balancer" \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=rag-guide-alb-sg},{Key=Project,Value=RAGGuide}]' \
  --query 'GroupId' \
  --output text)

echo "Created ALB Security Group: $ALB_SG_ID"

# Add inbound rules for HTTP and HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Create a security group for the backend service
BACKEND_SG_ID=$(aws ec2 create-security-group \
  --group-name rag-guide-backend-sg \
  --description "Security group for RAG Guide backend service" \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=rag-guide-backend-sg},{Key=Project,Value=RAGGuide}]' \
  --query 'GroupId' \
  --output text)

echo "Created Backend Security Group: $BACKEND_SG_ID"

# Allow inbound traffic only from the ALB
aws ec2 authorize-security-group-ingress \
  --group-id $BACKEND_SG_ID \
  --protocol tcp \
  --port 3000 \
  --source-group $ALB_SG_ID

# Create a security group for the frontend service
FRONTEND_SG_ID=$(aws ec2 create-security-group \
  --group-name rag-guide-frontend-sg \
  --description "Security group for RAG Guide frontend service" \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=rag-guide-frontend-sg},{Key=Project,Value=RAGGuide}]' \
  --query 'GroupId' \
  --output text)

echo "Created Frontend Security Group: $FRONTEND_SG_ID"

# Allow inbound traffic only from the ALB
aws ec2 authorize-security-group-ingress \
  --group-id $FRONTEND_SG_ID \
  --protocol tcp \
  --port 80 \
  --source-group $ALB_SG_ID

# Save the security group IDs to environment variables
echo "export ALB_SG_ID=$ALB_SG_ID" >> .env
echo "export BACKEND_SG_ID=$BACKEND_SG_ID" >> .env
echo "export FRONTEND_SG_ID=$FRONTEND_SG_ID" >> .env
```

#### Create Application Load Balancer and Target Groups

```bash
# Create target group for the backend service
BACKEND_TG_ARN=$(aws elbv2 create-target-group \
  --name rag-guide-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /health \
  --health-check-protocol HTTP \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 3 \
  --unhealthy-threshold-count 3 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "Created Backend Target Group: $BACKEND_TG_ARN"

# Create target group for the frontend service
FRONTEND_TG_ARN=$(aws elbv2 create-target-group \
  --name rag-guide-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path / \
  --health-check-protocol HTTP \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 3 \
  --unhealthy-threshold-count 3 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

echo "Created Frontend Target Group: $FRONTEND_TG_ARN"

# Create an Application Load Balancer
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name rag-guide-alb \
  --subnets $PUBLIC_SUBNET_1_ID $PUBLIC_SUBNET_2_ID \
  --security-groups $ALB_SG_ID \
  --type application \
  --tags Key=Project,Value=RAGGuide \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

echo "Created Application Load Balancer: $ALB_ARN"

# Create a listener for HTTP (port 80)
HTTP_LISTENER_ARN=$(aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$FRONTEND_TG_ARN \
  --query 'Listeners[0].ListenerArn' \
  --output text)

echo "Created HTTP Listener: $HTTP_LISTENER_ARN"

# Create a rule for the backend API
aws elbv2 create-rule \
  --listener-arn $HTTP_LISTENER_ARN \
  --priority 10 \
  --conditions Field=path-pattern,Values='/api/*' \
  --actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN

# Save the target group ARNs to environment variables
echo "export BACKEND_TG_ARN=$BACKEND_TG_ARN" >> .env
echo "export FRONTEND_TG_ARN=$FRONTEND_TG_ARN" >> .env
```

### 7. Create a Unified Deployment Script

Let's create a single script that will run all the necessary steps to deploy your application to AWS ECS:

```bash
cat > setup-and-deploy.sh << 'EOL'
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
EOL

chmod +x setup-and-deploy.sh
```

### 8. Execute the Complete Deployment Process

After setting up all the required infrastructure components, you can run the unified deployment script:

```bash
# First, create all the infrastructure components
# (IAM roles, SSM parameters, VPC, subnets, etc.)
# as described in the previous sections

# Then, run the unified deployment script to deploy your application
./setup-and-deploy.sh
```

This script will:
1. Create/update ECR repositories
2. Build and push your Docker images 
3. Update task definitions with your actual IDs and ARNs
4. Create or update the ECS services
5. Display the load balancer URL for accessing your application

## Monitoring

You can monitor your application in the AWS Console:

1. ECS: https://console.aws.amazon.com/ecs/
2. CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/

## Troubleshooting

- Check container logs in CloudWatch Logs
- Use the ECS Exec feature to access running containers for debugging:

```bash
aws ecs execute-command --cluster rag-guide-cluster \
  --task task-id \
  --container rag-guide-backend \
  --interactive \
  --command "/bin/sh"
```