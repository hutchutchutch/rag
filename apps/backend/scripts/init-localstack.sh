#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be fully up..."
while ! curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "running"'; do
  echo "Waiting for S3 service to be ready..."
  sleep 1
done

echo "Creating S3 bucket for document storage..."
# Create a bucket for document storage
aws --endpoint-url=http://localhost:4566 s3 mb s3://rag-guide-documents

# Set bucket public access
aws --endpoint-url=http://localhost:4566 s3api put-bucket-acl --bucket rag-guide-documents --acl public-read

# Set CORS configuration for the bucket to allow frontend access
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors --bucket rag-guide-documents --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'

# Verify bucket was created
aws --endpoint-url=http://localhost:4566 s3 ls

echo "LocalStack initialization completed successfully!"