#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be fully up..."
while ! curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "running"'; do
  echo "Waiting for S3 service to be ready..."
  sleep 1
done

echo "Creating S3 bucket for document storage..."
# Create a bucket for document storage
aws --endpoint-url=http://localhost:4566 s3 mb s3://rag-documents

# Set bucket public access
aws --endpoint-url=http://localhost:4566 s3api put-bucket-acl --bucket rag-documents --acl public-read

echo "LocalStack initialization completed successfully!"