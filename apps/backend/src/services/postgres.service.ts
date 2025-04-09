import pkg from 'pg';
const { Pool } = pkg;
import config from '../config/index';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

// Add pgvector extension
import 'pgvector/pg';

class PostgresService {
  private pool: Pool;
  private genAI: GoogleGenerativeAI;
  private embeddingModel: string = 'embedding-001';
  
  constructor() {
    this.pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      user: config.postgres.user,
      password: config.postgres.password,
      database: config.postgres.database,
    });
    
    this.genAI = new GoogleGenerativeAI(config.googleApiKey!);
    
    // Initialize database tables and extensions
    this.initialize();
  }
  
  /**
   * Initialize database tables and extensions
   */
  private async initialize(): Promise<void> {
    try {
      const client = await this.pool.connect();
      
      try {
        // Create pgvector extension if not exists
        await client.query('CREATE EXTENSION IF NOT EXISTS vector');
        
        // Create documents table
        await client.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            source TEXT NOT NULL,
            s3_key TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create document_chunks table with vector field
        await client.query(`
          CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            text TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            embedding vector(768),
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create vector index for fast similarity search
        await client.query(`
          CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
          ON document_chunks 
          USING ivfflat (embedding vector_cosine_ops)
          WITH (lists = 100)
        `);
        
        console.log('PostgreSQL tables and extensions initialized');
      } catch (error) {
        console.error('Error initializing PostgreSQL:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (connectionError) {
      console.warn('Unable to connect to PostgreSQL database:', connectionError.message);
      console.warn('Operating in mock mode without PostgreSQL connection');
    }
  }
  
  /**
   * Get embedding from Gemini model
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: this.embeddingModel });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error getting embedding from Gemini:', error);
      throw error;
    }
  }
  
  /**
   * Store document with metadata
   */
  async storeDocument(
    documentId: string,
    title: string,
    source: string,
    s3Key?: string
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query(
        `
        INSERT INTO documents (id, title, source, s3_key)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET title = $2, source = $3, s3_key = $4
        `,
        [documentId, title, source, s3Key]
      );
      
      console.log(`Document ${documentId} stored in PostgreSQL`);
    } catch (error) {
      console.error('Error storing document in PostgreSQL:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Store document chunks with embeddings
   */
  async storeDocumentChunks(
    documentId: string,
    chunks: { text: string; metadata: Record<string, any> }[]
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkId = uuidv4();
        const embedding = await this.getEmbedding(chunk.text);
        
        await client.query(
          `
          INSERT INTO document_chunks (id, document_id, text, chunk_index, embedding, metadata)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [chunkId, documentId, chunk.text, i, embedding, JSON.stringify(chunk.metadata)]
        );
      }
      
      console.log(`Stored ${chunks.length} chunks for document ${documentId} in PostgreSQL`);
    } catch (error) {
      console.error('Error storing document chunks in PostgreSQL:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Perform vector similarity search
   */
  async similaritySearch(
    query: string,
    limit: number = 5
  ): Promise<Array<{ id: string; text: string; score: number; metadata: Record<string, any> }>> {
    try {
      const client = await this.pool.connect();
      
      try {
        const embedding = await this.getEmbedding(query);
        
        const result = await client.query(
          `
          SELECT
            id,
            text,
            1 - (embedding <=> $1) AS score,
            metadata
          FROM document_chunks
          ORDER BY embedding <=> $1
          LIMIT $2
          `,
          [embedding, limit]
        );
        
        return result.rows.map(row => ({
          id: row.id,
          text: row.text,
          score: row.score,
          metadata: row.metadata,
        }));
      } catch (error) {
        console.error('Error performing PostgreSQL similarity search:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (connectionError) {
      console.warn('Unable to connect to PostgreSQL database, using mock data:', connectionError.message);
      // Use mock data from imported mock service
      return [
        {
          id: `mock-1-${Date.now()}`,
          text: `This is a mock result for the query: "${query}"`,
          score: 0.95,
          metadata: { source: 'mock', page: 1 }
        },
        {
          id: `mock-2-${Date.now()}`,
          text: 'RAG systems combine retrieval components with generation models to create outputs based on external data sources.',
          score: 0.88,
          metadata: { source: 'mock', page: 2 }
        },
        {
          id: `mock-3-${Date.now()}`,
          text: 'Vector databases store embeddings that capture the semantic meaning of text, enabling efficient similarity search.',
          score: 0.82,
          metadata: { source: 'mock', page: 3 }
        }
      ].slice(0, limit);
    }
  }
  
  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

export default new PostgresService();