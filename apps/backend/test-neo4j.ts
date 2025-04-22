// Simple script to test Neo4j connection and vector indexing
import neo4j, { Session, Record as Neo4jRecord } from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables from the backend .env file
dotenv.config({ path: './.env' });

// Verify environment variables are loaded
console.log('Environment variables:');
console.log(`- NEO4J_URI: ${process.env.NEO4J_URI || 'Not set'}`);
console.log(`- NEO4J_USERNAME: ${process.env.NEO4J_USERNAME || 'Not set'}`);
console.log(`- NEO4J_PASSWORD: ${process.env.NEO4J_PASSWORD ? '****' : 'Not set'}`);
console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '**** (set)' : 'Not set'}`);
console.log(`- GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? '**** (set)' : 'Not set'}`);

// Neo4j connection details - use localhost since we're connecting from host to container
const uri = 'bolt://localhost:7687';
const username = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'testpassword';

console.log(`Connecting to Neo4j at ${uri}...`);

// Create a Neo4j driver instance
const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
  {
    encrypted: false,
    connectionTimeout: 30000,
    maxTransactionRetryTime: 30000
  }
);

// Function to verify connection
async function verifyConnection(): Promise<boolean> {
  const session: Session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS n');
    console.log('Successfully connected to Neo4j');
    return true;
  } catch (error: any) {
    console.error('Failed to connect to Neo4j:', error.message);
    return false;
  } finally {
    await session.close();
  }
}

// Function to check Neo4j version
async function checkVersion(): Promise<void> {
  const session: Session = driver.session();
  try {
    const result = await session.run(
      'CALL dbms.components() YIELD name, versions, edition RETURN name, versions, edition'
    );
    
    if (result.records.length > 0) {
      const name = result.records[0].get('name');
      const versions = result.records[0].get('versions');
      const edition = result.records[0].get('edition');
      console.log(`Neo4j Details:`);
      console.log(`- Name: ${name}`);
      console.log(`- Version: ${versions[0]}`);
      console.log(`- Edition: ${edition}`);
    }
  } catch (error: any) {
    console.error('Failed to get Neo4j version:', error.message);
  } finally {
    await session.close();
  }
}

// Function to test vector index creation
async function testVectorIndex(): Promise<boolean> {
  const session: Session = driver.session();
  try {
    // 1. Check if the index exists
    try {
      const existingIndex = await session.run(`
        SHOW INDEXES WHERE name = 'document_chunk_embeddings'
      `);
      
      if (existingIndex.records.length > 0) {
        console.log('Vector index already exists');
        return true;
      } else {
        console.log('Vector index does not exist, attempting to create it');
      }
    } catch (error: any) {
      console.warn('Error checking for existing index:', error.message);
    }
    
    // 2. Try to create the index with Neo4j 5.15+ syntax
    try {
      await session.run(`
        CREATE VECTOR INDEX document_chunk_embeddings
        FOR (c:DocumentChunk)
        ON (c.embedding)
        OPTIONS {indexConfig: {
          \`vector.dimensions\`: 768,
          \`vector.similarity_function\`: "cosine"
        }}
      `);
      console.log('Successfully created vector index with modern syntax');
      return true;
    } catch (error: any) {
      console.warn('Error creating vector index with modern syntax:', error.message);
    }
    
    // 3. Try to create with older syntax
    try {
      await session.run(`
        CALL db.index.vector.createNodeIndex(
          'document_chunk_embeddings',
          'DocumentChunk',
          'embedding',
          768,
          'cosine'
        )
      `);
      console.log('Successfully created vector index with older syntax');
      return true;
    } catch (error: any) {
      console.error('Failed to create vector index with older syntax:', error.message);
      return false;
    }
  } catch (error: any) {
    console.error('Error in testVectorIndex:', error.message);
    return false;
  } finally {
    await session.close();
  }
}

// Function to test vector search
async function testVectorSearch(): Promise<boolean> {
  const session: Session = driver.session();
  try {
    // Create a test node with embedding
    const embedding: number[] = Array(768).fill(0).map((_, i) => Math.sin(i) * 0.1);
    
    try {
      // First create a test document chunk
      await session.run(`
        MERGE (c:DocumentChunk {id: 'test-chunk'})
        SET c.text = 'This is a test document chunk for vector search',
            c.embedding = $embedding
        RETURN c
      `, { embedding });
      
      console.log('Created test document chunk with embedding');
      
      // Try the vector search
      try {
        const result = await session.run(`
          CALL db.index.vector.queryNodes('document_chunk_embeddings', 1, $embedding)
          YIELD node, score
          RETURN node.id AS id, node.text AS text, score
        `, { embedding });
        
        if (result.records.length > 0) {
          console.log('Vector search succeeded!');
          console.log('Result:', result.records[0].get('text'));
          return true;
        } else {
          console.log('Vector search returned no results');
        }
      } catch (error: any) {
        console.warn('Modern vector search failed:', error.message);
        
        // Try alternative search method
        try {
          const result = await session.run(`
            MATCH (c:DocumentChunk)
            WITH c, vector.similarity(c.embedding, $embedding) AS score
            ORDER BY score DESC
            LIMIT 1
            RETURN c.id AS id, c.text AS text, score
          `, { embedding });
          
          if (result.records.length > 0) {
            console.log('Alternative vector search succeeded!');
            console.log('Result:', result.records[0].get('text'));
            return true;
          } else {
            console.log('Alternative vector search returned no results');
          }
        } catch (error: any) {
          console.error('Alternative vector search failed:', error.message);
        }
      }
    } catch (error: any) {
      console.error('Failed to create test document:', error.message);
    }
    
    return false;
  } catch (error: any) {
    console.error('Error in testVectorSearch:', error.message);
    return false;
  } finally {
    await session.close();
  }
}

// Main test function
async function main(): Promise<void> {
  try {
    // 1. Verify connection
    const connected = await verifyConnection();
    if (!connected) {
      console.error('Connection test failed. Exiting.');
      await driver.close();
      return;
    }
    
    // 2. Check Neo4j version
    await checkVersion();
    
    // 3. Test vector index creation
    const indexCreated = await testVectorIndex();
    if (!indexCreated) {
      console.warn('Vector index creation test failed. This may affect vector search.');
    }
    
    // 4. Test vector search
    const searchWorking = await testVectorSearch();
    if (!searchWorking) {
      console.warn('Vector search test failed.');
    }
    
    // Overall result
    if (indexCreated && searchWorking) {
      console.log('All tests PASSED! Neo4j vector capability is working correctly.');
    } else {
      console.log('Some tests FAILED. Please check the logs for details.');
    }
  } catch (error) {
    console.error('Main test function error:', error);
  } finally {
    await driver.close();
  }
}

// Run the tests
main().catch(console.error);