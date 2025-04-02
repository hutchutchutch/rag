# Neo4j on AWS ECS Fargate

This document provides guidance on deploying Neo4j as an ECS Fargate service using the provided task definition.

## Prerequisites

1. An AWS account with appropriate permissions
2. AWS CLI installed and configured
3. An ECS cluster (or create a new one)
4. A VPC with at least two subnets in different availability zones
5. An EFS file system for persistent storage
6. IAM roles for task execution and task role
7. Security parameters stored in AWS Parameter Store

## Deployment Steps

### 1. Create EFS File System (if not already created)

```bash
aws efs create-file-system \
    --performance-mode generalPurpose \
    --throughput-mode bursting \
    --encrypted \
    --tags Key=Name,Value=neo4j-data
```

Note the file system ID (fs-xxxxxx) for use in the task definition.

### 2. Create EFS Access Points

```bash
# For data directory
aws efs create-access-point \
    --file-system-id fs-YOUR_EFS_ID \
    --posix-user Uid=1000,Gid=1000 \
    --root-directory Path=/data,CreationInfo="{OwnerUid=1000,OwnerGid=1000,Permissions=755}"

# For plugins directory
aws efs create-access-point \
    --file-system-id fs-YOUR_EFS_ID \
    --posix-user Uid=1000,Gid=1000 \
    --root-directory Path=/plugins,CreationInfo="{OwnerUid=1000,OwnerGid=1000,Permissions=755}"

# For import directory
aws efs create-access-point \
    --file-system-id fs-YOUR_EFS_ID \
    --posix-user Uid=1000,Gid=1000 \
    --root-directory Path=/import,CreationInfo="{OwnerUid=1000,OwnerGid=1000,Permissions=755}"
```

### 3. Create Security Groups

```bash
# Create security group for Neo4j
aws ec2 create-security-group \
    --group-name neo4j-sg \
    --description "Security group for Neo4j" \
    --vpc-id vpc-YOUR_VPC_ID

# Allow inbound traffic
aws ec2 authorize-security-group-ingress \
    --group-id sg-YOUR_SG_ID \
    --protocol tcp \
    --port 7474 \
    --cidr YOUR_CIDR_BLOCK

aws ec2 authorize-security-group-ingress \
    --group-id sg-YOUR_SG_ID \
    --protocol tcp \
    --port 7687 \
    --cidr YOUR_CIDR_BLOCK
```

### 4. Store Neo4j Password in Parameter Store

```bash
aws ssm put-parameter \
    --name /neo4j/password \
    --type SecureString \
    --value "YOUR_SECRET_PASSWORD"
```

### 5. Update Task Definition

Edit the task-definition.json file and replace:
- YOUR_ACCOUNT_ID with your AWS account ID
- YOUR_REGION with your AWS region
- fs-YOUR_EFS_ID with your EFS file system ID

### 6. Register Task Definition

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 7. Create ECS Service

```bash
aws ecs create-service \
    --cluster YOUR_CLUSTER_NAME \
    --service-name neo4j-service \
    --task-definition neo4j-ecs:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-YOUR_SUBNET_ID1,subnet-YOUR_SUBNET_ID2],securityGroups=[sg-YOUR_SG_ID],assignPublicIp=ENABLED}" \
    --enable-execute-command \
    --health-check-grace-period-seconds 120
```

## Configuration Notes

### High Availability

For a high-availability Neo4j cluster, consider:
1. Setting up multiple Neo4j instances in a causal cluster
2. Using different task definitions for core and read replica nodes
3. Adding appropriate discovery settings in the environment variables

### Security Considerations

1. Limit access to Neo4j ports (7474, 7687) using security groups
2. Store sensitive information like passwords in AWS Secrets Manager or Parameter Store
3. Use IAM roles with least privilege
4. Enable encryption in transit and at rest
5. Consider using VPC endpoints to keep traffic within AWS network

### Monitoring

1. Set up CloudWatch alarms for Neo4j metrics
2. Configure log forwarding to CloudWatch Logs
3. Consider using AWS X-Ray for tracing
4. Set up health checks and auto-scaling policies

## Troubleshooting

1. Check ECS service events for deployment issues
2. Examine container logs in CloudWatch Logs
3. Verify that the EFS mount points are accessible
4. Check security group rules to ensure proper connectivity
5. Verify that the task role has appropriate permissions