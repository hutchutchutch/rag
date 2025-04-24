/**
 * Simple test script to test the Chapter 12 functionality
 * 
 * To run:
 * node scripts/chapter12-test.js
 */

// Using native fetch API available in Node.js v18+
// No need to import node-fetch

const BASE_URL = 'http://localhost:3000/api/documents';

// Step 1: Ingest Chapter 12
async function ingestChapter12() {
  try {
    console.log('Ingesting Chapter 12...');
    const response = await fetch(`${BASE_URL}/chapter12/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Ingestion result:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error ingesting Chapter 12:', error);
    throw error;
  }
}

// Step 2: Query Chapter 12
async function queryChapter12(query) {
  try {
    console.log(`Querying Chapter 12 with: "${query}"`);
    const response = await fetch(`${BASE_URL}/chapter12/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    console.log('Query result:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error querying Chapter 12:', error);
    throw error;
  }
}

// Step 3: Chat with Chapter 12
async function chatWithChapter12(message) {
  try {
    console.log(`Chatting with Chapter 12: "${message}"`);
    const response = await fetch(`http://localhost:3000/api/chat/chapter12`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    console.log('Chat result:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error chatting with Chapter 12:', error);
    throw error;
  }
}

// Main function to run the tests
async function main() {
  try {
    // First ingest Chapter 12
    // await ingestChapter12();
    
    // Wait a bit for processing to complete
    // console.log('Waiting for processing to complete...');
    // await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Query Chapter 12
    const queryResult = await queryChapter12('Why don\'t people want relationships?');
    console.log(queryResult, 'queryResult')
    
    // Chat with Chapter 12
    const chatResult = await chatWithChapter12('Explain why birth control has impacted relationships.');
    console.log(chatResult, 'chatResult')
    
    console.log('Tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
main(); 