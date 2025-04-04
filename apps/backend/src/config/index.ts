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
  
  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'us-west-2',
    bucketName: process.env.AWS_BUCKET_NAME || 'rag-documents',
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
  },
  
  // Google Gemini API
  googleApiKey: process.env.GOOGLE_API_KEY,
  
  // OpenAI API
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Paths
  paths: {
    uploads: path.resolve(__dirname, '../../uploads'),
  },
};

export default config;