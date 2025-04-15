# Environment Variables Configuration Guide

This document explains the environment variables used in both the frontend and backend applications.

## Backend Environment Variables

Create a `.env` file in the `apps/backend` directory with the following variables:

### Server Configuration
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `NODE_ENV`: Environment (development, production, test)

### API Keys
- `OPENAI_API_KEY`: Your OpenAI API key (required for chat functionality)
- `OPENAI_MODEL`: Model to use (e.g., gpt-3.5-turbo, gpt-4)
- `OPENAI_TEMPERATURE`: Temperature setting for responses (0.0-1.0)
- `GOOGLE_API_KEY`: Your Google API key for Gemini (optional)

### Database Configuration
- `NEO4J_URI`: Neo4j connection string
- `NEO4J_USERNAME`: Neo4j username
- `NEO4J_PASSWORD`: Neo4j password
- `POSTGRES_HOST`: PostgreSQL host
- `POSTGRES_PORT`: PostgreSQL port
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name
- `POSTGRES_SSL`: Enable SSL for PostgreSQL (true/false)

### Storage Configuration
- `AWS_REGION`: AWS region
- `AWS_BUCKET_NAME`: S3 bucket name
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_ENDPOINT`: Custom endpoint for S3 (for LocalStack)

### Security
- `SESSION_SECRET`: Secret for encrypting session data
- `CORS_ORIGIN`: Main allowed origin
- `ADDITIONAL_CORS_ORIGINS`: Other allowed origins (comma-separated)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### Document Processing
- `MAX_DOCUMENT_SIZE_MB`: Maximum document size in MB
- `CHUNK_SIZE`: Size of text chunks for embedding
- `CHUNK_OVERLAP`: Overlap between chunks
- `EMBEDDING_DIMENSION`: Dimension of embeddings

### Optional Features
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_REDIRECT_URI`: Google OAuth redirect URI
- `LANGSMITH_API_KEY`: LangSmith API key for tracing
- `LANGSMITH_TRACING`: Enable LangSmith tracing (true/false)

### Logging
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `LOG_QUERIES`: Log database queries (true/false)

## Frontend Environment Variables

Create a `.env` file in the `apps/frontend` directory with the following variables:

### API Configuration
- `VITE_API_URL`: Backend API URL (e.g., http://localhost:3000/api)

### Feature Flags
- `VITE_ENABLE_GOOGLE_DRIVE`: Enable Google Drive integration
- `VITE_ENABLE_DEBUG_TOOLS`: Enable debug tools
- `VITE_ENABLE_NEO4J_GRAPH`: Enable Neo4j graph visualization
- `VITE_ENABLE_POSTGRES_VECTOR`: Enable PostgreSQL vector store
- `VITE_MAX_FILE_SIZE_MB`: Maximum file size for uploads

### UI Configuration
- `VITE_DEFAULT_THEME`: Default UI theme (light/dark)

## Docker Environment Variables

When running with Docker Compose, environment variables can be set in the docker-compose.yml file. For local development, the .env files will be used.

## Example Setup

1. Copy the example files:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

2. Edit the .env files to add your actual API keys and configuration.

3. For security, never commit .env files to version control. They are already added to .gitignore.
