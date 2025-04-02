# AWS S3 Bucket Setup

This document outlines the steps to create and configure an S3 bucket for storing documents and files for the RAG application.

## 1. Create S3 Bucket

### Using AWS CLI

```bash
aws s3api create-bucket \
    --bucket your-rag-documents-bucket \
    --region us-east-1
```

### Using AWS Console

1. Sign in to the AWS Management Console and open the S3 console.
2. Choose **Create bucket**.
3. Enter a bucket name that is globally unique (e.g., `your-rag-documents-bucket`).
4. Select the AWS Region where you want to create the bucket.
5. Configure the bucket settings as needed (encryption, versioning, etc.).
6. Choose **Create bucket**.

## 2. Configure Bucket Policy

Create a policy that allows your application to access the bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_ECS_TASK_ROLE"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-rag-documents-bucket",
        "arn:aws:s3:::your-rag-documents-bucket/*"
      ]
    }
  ]
}
```

## 3. Enable CORS (if needed for direct browser uploads)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-frontend-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 4. Backend Configuration

In your backend service, configure the AWS SDK to connect to your S3 bucket:

```typescript
// apps/backend/src/config/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-rag-documents-bucket';
```

## 5. IAM User for Development

For local development, create an IAM user with S3 access:

1. Create an IAM user with programmatic access.
2. Attach the `AmazonS3FullAccess` policy or a custom policy with required permissions.
3. Save the access key and secret key for local development.

## 6. Security Best Practices

- Use IAM roles for EC2/ECS instead of hardcoded credentials
- Enable S3 bucket encryption
- Use lifecycle policies to manage storage costs
- Consider using S3 bucket access logs for auditing
- Use VPC Endpoints for S3 to keep traffic within AWS network