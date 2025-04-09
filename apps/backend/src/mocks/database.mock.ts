/**
 * Mock database service for testing without external databases
 */

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
}

/**
 * Generate mock search results based on the query
 */
export function mockSimilaritySearch(query: string, limit: number = 5): SearchResult[] {
  const mockResults: SearchResult[] = [
    {
      id: 'mock-1',
      text: `This is a mock result for the query: "${query}"`,
      score: 0.95,
      metadata: { source: 'mock', page: 1 }
    },
    {
      id: 'mock-2',
      text: 'RAG systems combine retrieval components with generation models to create outputs based on external data sources.',
      score: 0.88,
      metadata: { source: 'mock', page: 2 }
    },
    {
      id: 'mock-3',
      text: 'Vector databases store embeddings that capture the semantic meaning of text, enabling efficient similarity search.',
      score: 0.82,
      metadata: { source: 'mock', page: 3 }
    },
    {
      id: 'mock-4',
      text: 'Neo4j can store knowledge graphs that represent relationships between entities mentioned in documents.',
      score: 0.76,
      metadata: { source: 'mock', page: 4 }
    },
    {
      id: 'mock-5',
      text: 'PgVector extends PostgreSQL with vector similarity operations for embedding-based search.',
      score: 0.71,
      metadata: { source: 'mock', page: 5 }
    }
  ];
  
  return mockResults.slice(0, limit);
}

/**
 * Generate a mock document ID for testing
 */
export function mockStoreDocument(title: string, source: string): { documentId: string; s3Key: string } {
  return {
    documentId: `mock-doc-${Date.now()}`,
    s3Key: `mock-s3/${Date.now()}-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
  };
}

/**
 * Generate mock chat response based on the query
 */
export function mockChatResponse(message: string): string {
  const responses = [
    `Based on the available information, "${message}" refers to a concept in retrieval-augmented generation systems.`,
    `That's an interesting question about "${message}". In RAG systems, we typically process this by retrieving relevant context first.`,
    `I found some information that might help answer your question about "${message}". Vector databases are crucial for efficiently retrieving relevant context.`,
    `Your query about "${message}" touches on an important aspect of modern AI systems. The combination of retrieval and generation is powerful for knowledge-intensive tasks.`
  ];
  
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}