import { mockSimilaritySearch, mockStoreDocument, mockChatResponse } from '../mocks/database.mock';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock service implementation for testing without external services
 */
class MockService {
  /**
   * Process a document and return a mock document ID
   */
  async processDocument(filePath: string): Promise<{ documentId: string; s3Key: string }> {
    try {
      // Read the file to get its contents (not using the contents, just checking the file)
      await fs.access(filePath);
      
      // Extract filename from path
      const fileName = path.basename(filePath);
      
      // Generate a mock document ID and S3 key
      return mockStoreDocument(fileName, 'file-upload');
    } catch (error) {
      console.error('Error in mock document processing:', error);
      throw new Error('Failed to process document');
    }
  }
  
  /**
   * Search documents with mock results
   */
  async searchDocuments(query: string, limit: number = 5): Promise<any[]> {
    return mockSimilaritySearch(query, limit);
  }
  
  /**
   * Get a mock pre-signed URL for downloading
   */
  async getPresignedUrl(key: string): Promise<string> {
    return `http://localhost:3000/mock-download/${key}`;
  }
  
  /**
   * Process a chat message and return a mock response
   */
  async processMessage(history: any[], message: string): Promise<string> {
    return mockChatResponse(message);
  }
}

export default new MockService();