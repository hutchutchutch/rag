export type CleanerType = 'simple' | 'advanced' | 'ocr-optimized';
export type ChunkingStrategy = 'fixed' | 'semantic' | 'sliding' | 'recursive';

export interface EmbeddingConfig {
  chunkSize: number;
  overlap: number;
  cleaner: CleanerType;
  strategy: ChunkingStrategy;
  model: string;
}

export interface Document {
  documentId: string;
  s3Key: string;
  downloadUrl: string;
}

export interface ChatMessage {
  type: 'human' | 'ai' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  history: ChatMessage[];
}

export interface SearchResult {
  text: string;
  score: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
}

// Backend API URL
const API_URL = 'http://localhost:3000/api';

/**
 * Upload a document to process through the RAG pipeline
 */
export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload document');
  }
  
  return response.json();
}

/**
 * Search for relevant document chunks
 */
export async function searchDocuments(query: string, limit: number = 5): Promise<SearchResponse> {
  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
  });
  
  const response = await fetch(`${API_URL}/documents/search?${params}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search documents');
  }
  
  return response.json();
}

/**
 * Send a message to the chat API
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process chat message');
  }
  
  return response.json();
}