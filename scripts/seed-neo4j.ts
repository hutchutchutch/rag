#!/usr/bin/env ts-node
/**
 * Neo4j Database Seed Script
 * 
 * This script initializes Neo4j with necessary constraints, indexes, 
 * and optional sample data for the RAG application.
 */

import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import { program } from 'commander';

dotenv.config();

// Neo4j connection parameters
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

// Initialize Neo4j driver
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  { maxConnectionLifetime: 3 * 60 * 60 * 1000 } // 3 hours
);

// Command line arguments
program
  .option('--drop-all', 'Drop all data before seeding (BE CAREFUL!)')
  .option('--constraints-only', 'Only create constraints and indexes without sample data')
  .option('--sample-data', 'Include sample data')
  .parse(process.argv);

const options = program.opts();

// Main function
async function main() {
  console.log('🔌 Connecting to Neo4j at:', NEO4J_URI);
  
  try {
    // Test connection
    const serverInfo = await getServerInfo();
    console.log(`✅ Connected to Neo4j ${serverInfo.version}`);
    
    // Optionally drop everything (DANGER!)
    if (options.dropAll) {
      console.log('⚠️  Dropping all data and constraints...');
      await runQuery('MATCH (n) DETACH DELETE n');
      await runQuery('CALL apoc.schema.assert({}, {})');
      console.log('✅ Database cleared');
    }
    
    // Create constraints and indexes
    console.log('🔑 Creating constraints and indexes...');
    await createConstraintsAndIndexes();
    
    // Optionally seed sample data
    if (options.sampleData) {
      console.log('📊 Seeding sample data...');
      await seedSampleData();
    }
    
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    // Close driver connection
    await driver.close();
  }
}

// Helper function to execute Cypher queries
async function runQuery(query: string, params = {}): Promise<any> {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result;
  } finally {
    await session.close();
  }
}

// Get Neo4j server info
async function getServerInfo(): Promise<{ version: string }> {
  const result = await runQuery('RETURN 1');
  return {
    version: result.summary.server.version
  };
}

// Create constraints and indexes for the RAG application
async function createConstraintsAndIndexes() {
  // Create constraints
  const constraints = [
    // Document nodes
    "CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE",
    
    // Chunk nodes
    "CREATE CONSTRAINT chunk_id IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE",
    
    // Entity nodes
    "CREATE CONSTRAINT entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE",
    
    // Concept nodes
    "CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE"
  ];
  
  // Create vector indexes if Neo4j supports them (Neo4j 5.15+ or with vector plugin)
  const vectorIndexes = [
    `
    CREATE VECTOR INDEX chunk_embedding IF NOT EXISTS
    FOR (c:Chunk) 
    ON c.embedding
    OPTIONS {indexConfig: {
      vector: {dimensions: 1536, similarity: "cosine"}
    }}
    `
  ];
  
  // Create full-text indexes
  const fullTextIndexes = [
    `
    CREATE FULLTEXT INDEX chunk_content IF NOT EXISTS
    FOR (c:Chunk)
    ON EACH [c.content]
    OPTIONS {indexConfig: {fulltext: {analyzer: "english"}}}
    `,
    `
    CREATE FULLTEXT INDEX document_content IF NOT EXISTS
    FOR (d:Document)
    ON EACH [d.title, d.description]
    OPTIONS {indexConfig: {fulltext: {analyzer: "english"}}}
    `
  ];
  
  // Execute all constraint and index creation queries
  for (const query of [...constraints, ...vectorIndexes, ...fullTextIndexes]) {
    try {
      await runQuery(query);
      console.log(`✅ Executed: ${query.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Error executing: ${query}`);
      console.error(error);
      
      // If vector index fails, it might be because the Neo4j version doesn't support it
      if (query.includes('VECTOR INDEX')) {
        console.warn('⚠️  Vector index creation failed. Ensure Neo4j version 5.15+ or the vector plugin is installed.');
      } else {
        throw error;
      }
    }
  }
}

// Seed sample data for testing
async function seedSampleData() {
  // Create sample documents
  const documentsQuery = `
    CREATE (d1:Document {
      id: "doc-1",
      title: "Introduction to RAG",
      description: "A comprehensive guide to Retrieval-Augmented Generation",
      url: "https://example.com/docs/rag-intro",
      sourceType: "pdf",
      createdAt: datetime(),
      metadata: {
        author: "Jane Smith",
        pages: 42
      }
    })
    
    CREATE (d2:Document {
      id: "doc-2",
      title: "Vector Databases Explained",
      description: "Understanding vector databases for semantic search",
      url: "https://example.com/docs/vector-dbs",
      sourceType: "webpage",
      createdAt: datetime(),
      metadata: {
        author: "John Doe",
        wordCount: 2500
      }
    })
    
    CREATE (d3:Document {
      id: "doc-3",
      title: "Knowledge Graphs in AI",
      description: "How knowledge graphs enhance AI and LLM capabilities",
      url: "https://example.com/docs/kg-ai",
      sourceType: "pdf",
      createdAt: datetime(),
      metadata: {
        author: "Alex Johnson",
        pages: 78
      }
    })
  `;
  
  // Create sample chunks
  const chunksQuery = `
    MATCH (d1:Document {id: "doc-1"})
    CREATE (c1:Chunk {
      id: "chunk-1",
      content: "Retrieval-Augmented Generation (RAG) is a technique that enhances large language models by retrieving relevant information from external knowledge sources.",
      embedding: [0.1, 0.2, 0.3]
    })
    CREATE (c2:Chunk {
      id: "chunk-2",
      content: "RAG systems typically consist of a retriever component that finds relevant documents and a generator that produces output based on the retrieved context.",
      embedding: [0.2, 0.3, 0.4]
    })
    CREATE (d1)-[:CONTAINS]->(c1)
    CREATE (d1)-[:CONTAINS]->(c2)
    
    MATCH (d2:Document {id: "doc-2"})
    CREATE (c3:Chunk {
      id: "chunk-3",
      content: "Vector databases store embeddings, which are numerical representations of data that capture semantic meaning.",
      embedding: [0.3, 0.4, 0.5]
    })
    CREATE (c4:Chunk {
      id: "chunk-4",
      content: "Similarity search in vector databases enables finding content based on meaning rather than exact keyword matches.",
      embedding: [0.4, 0.5, 0.6]
    })
    CREATE (d2)-[:CONTAINS]->(c3)
    CREATE (d2)-[:CONTAINS]->(c4)
    
    MATCH (d3:Document {id: "doc-3"})
    CREATE (c5:Chunk {
      id: "chunk-5",
      content: "Knowledge graphs represent information as entities and relationships, providing structured context for AI systems.",
      embedding: [0.5, 0.6, 0.7]
    })
    CREATE (c6:Chunk {
      id: "chunk-6",
      content: "Combining vector search with knowledge graphs creates hybrid retrieval systems that leverage both semantic similarity and explicit relationships.",
      embedding: [0.6, 0.7, 0.8]
    })
    CREATE (d3)-[:CONTAINS]->(c5)
    CREATE (d3)-[:CONTAINS]->(c6)
  `;
  
  // Create sample entities and concepts
  const entitiesQuery = `
    CREATE (e1:Entity {id: "entity-1", name: "RAG", type: "technology"})
    CREATE (e2:Entity {id: "entity-2", name: "Vector Database", type: "technology"})
    CREATE (e3:Entity {id: "entity-3", name: "Knowledge Graph", type: "concept"})
    CREATE (e4:Entity {id: "entity-4", name: "Embeddings", type: "concept"})
    
    MATCH (c1:Chunk {id: "chunk-1"}), (e1:Entity {id: "entity-1"})
    CREATE (c1)-[:MENTIONS]->(e1)
    
    MATCH (c3:Chunk {id: "chunk-3"}), (e2:Entity {id: "entity-2"}), (e4:Entity {id: "entity-4"})
    CREATE (c3)-[:MENTIONS]->(e2)
    CREATE (c3)-[:MENTIONS]->(e4)
    
    MATCH (c5:Chunk {id: "chunk-5"}), (e3:Entity {id: "entity-3"})
    CREATE (c5)-[:MENTIONS]->(e3)
    
    CREATE (c:Concept {id: "concept-1", name: "Information Retrieval"})
    CREATE (c:Concept {id: "concept-2", name: "Semantic Search"})
    CREATE (c:Concept {id: "concept-3", name: "Artificial Intelligence"})
    
    MATCH (e1:Entity {id: "entity-1"}), (c:Concept {id: "concept-1"})
    CREATE (e1)-[:RELATED_TO]->(c)
    
    MATCH (e2:Entity {id: "entity-2"}), (c:Concept {id: "concept-2"})
    CREATE (e2)-[:RELATED_TO]->(c)
    
    MATCH (e3:Entity {id: "entity-3"}), (c:Concept {id: "concept-3"})
    CREATE (e3)-[:RELATED_TO]->(c)
  `;
  
  // Execute sample data creation
  await runQuery(documentsQuery);
  await runQuery(chunksQuery);
  await runQuery(entitiesQuery);
  
  console.log('✅ Sample data created');
}

// Run the main function
main();