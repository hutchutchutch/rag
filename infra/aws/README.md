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

1. Create an ECS task execution role (if not already present):

```bash
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://trust-policy.json

# Attach the Amazon managed policy
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

2. Create the application-specific task role:

```bash
aws iam create-role --role-name rag-guide-ecs-task-role --assume-role-policy-document file://trust-policy.json

# Create the application policy
aws iam create-policy --policy-name rag-guide-task-policy --policy-document file://iam/rag-guide-task-role-policy.json

# Attach the policy to the role
aws iam attach-role-policy --role-name rag-guide-ecs-task-role --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/rag-guide-task-policy
```

### 3. Store Secrets in Parameter Store

```bash
# Neo4j credentials
aws ssm put-parameter --name "/rag-guide/neo4j/user" --value "neo4j" --type SecureString
aws ssm put-parameter --name "/rag-guide/neo4j/password" --value "your-password" --type SecureString

# PostgreSQL credentials
aws ssm put-parameter --name "/rag-guide/postgres/user" --value "postgres" --type SecureString
aws ssm put-parameter --name "/rag-guide/postgres/password" --value "your-password" --type SecureString

# API Keys
aws ssm put-parameter --name "/rag-guide/google/api-key" --value "your-google-api-key" --type SecureString
aws ssm put-parameter --name "/rag-guide/openai/api-key" --value "your-openai-api-key" --type SecureString
```

### 4. Create an ECS Cluster

```bash
aws ecs create-cluster --cluster-name rag-guide-cluster
```

### 5. Create VPC, Subnets, and Security Groups

For a complete setup, you'll need:
- A VPC with public and private subnets
- Security groups for the application
- Load balancers and target groups

These resources can be created using CloudFormation or through the AWS console.

### 6. Run the Deployment Script

Make sure to set the correct environment variables, then run:

```bash
./deploy.sh
```

## Creating ECS Services (First-time Setup)

Once you've deployed your task definitions using the deploy script, you need to create the ECS services for the first time:

1. Update service definition files with your actual VPC/subnet/security group IDs
2. Create the backend service:

```bash
aws ecs create-service --cli-input-json file://ecs/rag-guide-backend-service.json
```

3. Create the frontend service:

```bash
aws ecs create-service --cli-input-json file://ecs/rag-guide-frontend-service.json
```

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