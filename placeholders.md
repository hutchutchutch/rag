# RAG System Placeholders

This document lists all the placeholders in the codebase that need to be replaced to make the application live, along with security best practices for storing sensitive information.

## API Keys and Authentication

### Google Gemini API Key
- **File:** `/apps/backend/src/config/index.ts`
- **Line:** `googleApiKey: process.env.GOOGLE_API_KEY,`
- **Description:** You need to provide a valid Google Gemini API key for the embedding model to work
- **How to get:** Sign up for Google AI Studio and get an API key from [https://ai.google.dev/](https://ai.google.dev/)
- **Security best practice:** Do not store in code. Use environment variables or a secrets manager.

### OpenAI API Key
- **File:** `/apps/backend/src/config/index.ts`
- **Line:** `openaiApiKey: process.env.OPENAI_API_KEY,`
- **Description:** Required for the language model in the chat service
- **File:** `/apps/backend/src/services/chat.service.ts`
- **Line:** `this.llm = new ChatOpenAI({ apiKey: config.openaiApiKey, modelName: 'gpt-3.5-turbo', temperature: 0.7 });`
- **How to get:** Sign up for OpenAI API at [https://platform.openai.com/](https://platform.openai.com/)
- **Security best practice:** Store in a secure environment variable or secrets manager. Never commit to code repository.

## AWS S3 Configuration

### AWS Credentials and Configuration
- **File:** `/apps/backend/src/config/index.ts`
- **Lines:**
  ```
  aws: {
    region: process.env.AWS_REGION || 'us-west-2',
    bucketName: process.env.AWS_BUCKET_NAME || 'rag-documents',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
  },
  ```
- **Description:** In production, you need to provide real AWS credentials with permissions to access S3
- **Note:** The endpoint is only needed when using LocalStack for development
- **Security best practice:** Use IAM roles instead of access keys when deploying to AWS. For non-AWS platforms, use environment variables or secrets management services.

## Database Configuration

### Neo4j Connection Details
- **File:** `/apps/backend/src/config/index.ts`
- **Lines:**
  ```
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://neo4j:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  },
  ```
- **Description:** For production, use secure credentials and proper URI
- **Note:** The default values are only meant for local development
- **Security best practice:** Store connection strings and credentials in environment variables or a secrets management service. Use SSL/TLS for connections.

### PostgreSQL Connection Details
- **File:** `/apps/backend/src/config/index.ts`
- **Lines:**
  ```
  postgres: {
    host: process.env.POSTGRES_HOST || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'ragdb',
  },
  ```
- **Description:** For production, use secure credentials and proper host
- **Note:** The default values are only meant for local development
- **Security best practice:** Use a secure password management system like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault. For Kubernetes, use Kubernetes Secrets.

## Frontend Configuration

### Backend API URL
- **File:** `/apps/frontend/src/lib/rag.ts`
- **Line:** `const API_URL = 'http://localhost:3000/api';`
- **Description:** Change this to the production API URL when deploying
- **Note:** In production, this should be the domain where your backend is deployed
- **Security best practice:** Use environment variables at build time for different environments (development, staging, production). Consider using a configuration service for dynamic runtime configuration.

## Model Configuration

### LLM Model Selection
- **File:** `/apps/backend/src/services/chat.service.ts`
- **Line:** `modelName: 'gpt-3.5-turbo',`
- **Description:** Consider changing to a more powerful model for production
- **Options:** 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', etc.
- **Security best practice:** Store model selection in environment variables to easily switch between models without code changes.

### Gemini Embedding Model
- **File:** `/apps/backend/src/services/neo4j.service.ts` and `/apps/backend/src/services/postgres.service.ts`
- **Line:** `private embeddingModel: string = 'embedding-001';`
- **Description:** The embedding model from Google Gemini
- **Note:** Ensure this matches what's available in your Google AI account
- **Security best practice:** Store model name in configuration that can be changed without code deployments.

## Security Considerations and Best Practices for Sensitive Information

### Environment-Specific Configuration
- **Development:** Use `.env` files that are gitignored
- **CI/CD:** Use pipeline secrets/variables (GitHub Secrets, GitLab CI Variables, etc.)
- **Production:** Use platform-specific secrets management:
  - **AWS:** AWS Secrets Manager, Parameter Store, or ECS environment variables
  - **Azure:** Azure Key Vault or App Service application settings
  - **GCP:** Secret Manager or Cloud Run environment variables
  - **Kubernetes:** Kubernetes Secrets with proper RBAC

### Best Practices for Secret Management
1. **Never commit secrets to code repositories**
   - Use `.gitignore` for local `.env` files
   - Consider using pre-commit hooks to check for secrets
   - Run secret scanning tools in your CI pipeline

2. **Rotate credentials regularly**
   - Implement automatic rotation where possible
   - Use temporary credentials with limited lifespans

3. **Principle of least privilege**
   - API keys should have minimal necessary permissions
   - Use separate credentials for different environments
   - Create read-only credentials when only read access is needed

4. **Secure storage**
   - Encrypt secrets at rest
   - Use dedicated secrets management services
   - Keep backup credentials in a secure location

5. **Audit and monitoring**
   - Log and monitor access to sensitive information
   - Set up alerts for unusual access patterns
   - Review access logs regularly

6. **Transport security**
   - Always use HTTPS for API communications
   - Implement proper CORS settings in production
   - Use encrypted database connections (TLS/SSL)

7. **Additional production security measures**
   - Implement proper rate limiting and authentication for the API
   - Set up WAF (Web Application Firewall) for public endpoints
   - Use VPC/network isolation for database services
   - Consider using managed database services with built-in encryption