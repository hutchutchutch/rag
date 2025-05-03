import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  
  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'us-west-2',
    bucketName: process.env.AWS_BUCKET_NAME || 'rag-guide-documents',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
  },
  
  // Neo4j
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://neo4j:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  },
  
  // PostgreSQL
  postgres: {
    host: process.env.POSTGRES_HOST || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'ragdb',
    ssl: process.env.POSTGRES_SSL === 'true',
  },
  
  // Google Gemini API
  googleApiKey: process.env.GOOGLE_API_KEY,
  
  // OpenAI API
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },
  
  // Removed Google Drive Integration
  
  // Document Processing
  documentProcessing: {
    maxSizeMB: parseInt(process.env.MAX_DOCUMENT_SIZE_MB || '10'),
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1000'),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200'),
    embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || '768'),
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    // Additional allowed origins can be specified as comma-separated list
    additionalOrigins: process.env.ADDITIONAL_CORS_ORIGINS 
      ? process.env.ADDITIONAL_CORS_ORIGINS.split(',') 
      : [],
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Max 100 requests per window
  },
  
  // LangGraph
  langGraph: {
    maxIterations: parseInt(process.env.LANGGRAPH_MAX_ITERATIONS || '10'),
    timeoutMs: parseInt(process.env.LANGGRAPH_TIMEOUT_MS || '60000'),
  },
  
  // Paths
  paths: {
    uploads: path.resolve(__dirname, '../../uploads'),
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    queries: process.env.LOG_QUERIES === 'true',
  },
};

export default config;