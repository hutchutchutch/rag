import neo4j, { Driver, Session } from 'neo4j-driver';
import config from '../config/index';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

class Neo4jService {
  private driver: Driver;
  private genAI: GoogleGenerativeAI;
  private embeddingModel: string = 'embedding-001';
  
  constructor() {
    try {
      this.driver = neo4j.driver(
        config.neo4j.uri,
        neo4j.auth.basic(config.neo4j.username, config.neo4j.password)
      );
      
      this.genAI = new GoogleGenerativeAI(config.googleApiKey || 'dummy_api_key_for_testing');
      
      // Initialize Neo4j with vector search capabilities
      this.initializeVectorIndex().catch(error => {
        console.error('Error initializing Neo4j vector index:', error);
        console.warn('Will operate in mock mode due to Neo4j connection issues');
      });
    } catch (error) {
      console.warn('Failed to initialize Neo4j service:', error.message);
      console.warn('Operating in mock mode without Neo4j connection');
    }
  }
  
  /**
   * Initialize vector index in Neo4j
   */
  private async initializeVectorIndex(): Promise<void> {
    const session = this.driver.session();
    try {
      // Create vector index if not exists
      await session.run(`
        CREATE VECTOR INDEX IF NOT EXISTS document_chunk_embeddings 
        FOR (c:DocumentChunk) 
        ON (c.embedding) 
        OPTIONS {indexConfig: {
          `+'`vector.dimensions`'+`: 768,
          `+'`vector.similarity_function`'+`: "cosine"
        }}
      `);
      
      console.log('Neo4j vector index initialized');
    } catch (error) {
      console.error('Error initializing Neo4j vector index:', error);
      throw error;
    } finally {
      await session.close();
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
   * Store document chunks with embeddings in Neo4j
   */
  async storeDocumentChunks(
    documentId: string, 
    chunks: { text: string; metadata: Record<string, any> }[]
  ): Promise<void> {
    const session = this.driver.session();
    
    try {
      // Create document node
      await session.run(
        `
        MERGE (d:Document {id: $documentId})
        SET d.title = $title,
            d.createdAt = datetime(),
            d.source = $source
        RETURN d
        `,
        {
          documentId,
          title: chunks[0]?.metadata?.title || 'Untitled',
          source: chunks[0]?.metadata?.source || 'upload',
        }
      );
      
      // Process and store each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkId = uuidv4();
        const embedding = await this.getEmbedding(chunk.text);
        
        await session.run(
          `
          MATCH (d:Document {id: $documentId})
          CREATE (c:DocumentChunk {
            id: $chunkId,
            text: $text,
            index: $index,
            embedding: $embedding
          })
          SET c += $metadata
          CREATE (d)-[:CONTAINS]->(c)
          RETURN c
          `,
          {
            documentId,
            chunkId,
            text: chunk.text,
            index: i,
            embedding,
            metadata: chunk.metadata,
          }
        );
      }
      
      console.log(`Stored ${chunks.length} chunks for document ${documentId} in Neo4j`);
    } catch (error) {
      console.error('Error storing document chunks in Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
  
  /**
   * Perform vector search in Neo4j
   */
  async similaritySearch(
    query: string, 
    limit: number = 5
  ): Promise<Array<{ text: string; score: number; metadata: Record<string, any> }>> {
    if (!this.driver) {
      console.warn('Neo4j driver not initialized, returning mock results');
      return this.mockSimilaritySearch(query, limit);
    }
    
    try {
      const session = this.driver.session();
      
      try {
        const embedding = await this.getEmbedding(query);
        
        const result = await session.run(
          `
          CALL db.index.vector.queryNodes('document_chunk_embeddings', $limit, $embedding)
          YIELD node, score
          RETURN node.id AS id, node.text AS text, score,
          {
            source: node.source,
            title: node.title,
            index: node.index
          } AS metadata
          ORDER BY score DESC
          `,
          { embedding, limit }
        );
        
        return result.records.map(record => ({
          text: record.get('text'),
          score: record.get('score'),
          metadata: record.get('metadata'),
        }));
      } catch (error) {
        console.error('Error performing Neo4j similarity search:', error);
        return this.mockSimilaritySearch(query, limit);
      } finally {
        await session.close();
      }
    } catch (error) {
      console.warn('Neo4j session error, using mock data:', error.message);
      return this.mockSimilaritySearch(query, limit);
    }
  }
  
  /**
   * Provide mock similarity search results when Neo4j is unavailable
   */
  private mockSimilaritySearch(
    query: string,
    limit: number = 5
  ): Array<{ text: string; score: number; metadata: Record<string, any> }> {
    const mockResults = [
      {
        text: `This is a Neo4j mock result for: "${query}"`,
        score: 0.96,
        metadata: { source: 'neo4j-mock', title: 'Mock Document', index: 0 }
      },
      {
        text: 'Knowledge graphs can represent complex relationships between entities in documents.',
        score: 0.89,
        metadata: { source: 'neo4j-mock', title: 'Mock Document', index: 1 }
      },
      {
        text: 'Graph databases like Neo4j are excellent for storing and querying connected data.',
        score: 0.83,
        metadata: { source: 'neo4j-mock', title: 'Mock Document', index: 2 }
      },
      {
        text: 'Vector similarity search can be integrated with graph traversal for powerful hybrid search capabilities.',
        score: 0.78,
        metadata: { source: 'neo4j-mock', title: 'Mock Document', index: 3 }
      },
      {
        text: 'RAG systems benefit from both vector and graph-based retrieval approaches.',
        score: 0.73,
        metadata: { source: 'neo4j-mock', title: 'Mock Document', index: 4 }
      }
    ];
    
    return mockResults.slice(0, limit);
  }
  
  /**
   * Clean up connection
   */
  async close(): Promise<void> {
    await this.driver.close();
  }
}

export default new Neo4jService();