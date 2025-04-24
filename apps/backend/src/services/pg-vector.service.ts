import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import postgresService from './postgres.service.js';

class PgVectorService {
  /**
   * Load Chapter 12 content from file
   */
  async loadChapter12File(): Promise<string> {
    try {
      // Path to the Chapter 12 file in the public directory of frontend
      const filePath = path.resolve('../frontend/public/Chapter 12.txt');
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error loading Chapter 12 file:', error);
      throw new Error('Failed to load Chapter 12 file');
    }
  }

  /**
   * Process the Chapter 12 content and store it in PGVector
   */
  async processChapter12(): Promise<{ documentId: string; chunkCount: number }> {
    try {
      const content = await this.loadChapter12File();
      
      // Generate a document ID
      const documentId = uuidv4();
      
      // Store document metadata
      await postgresService.storeDocument(
        documentId,
        'Chapter 12: People don\'t really want relationships',
        'Book Chapter',
        undefined
      );
      
      // Create text chunks
      const chunks = await this.chunkText(content, documentId);
      
      // Store chunks with embeddings
      await postgresService.storeDocumentChunks(documentId, chunks);
      
      console.log(`Processed Chapter 12 with ${chunks.length} chunks into PGVector`);
      
      return {
        documentId,
        chunkCount: chunks.length
      };
    } catch (error) {
      console.error('Error processing Chapter 12:', error);
      throw new Error('Failed to process Chapter 12 into PGVector store');
    }
  }
  
  /**
   * Chunk text into smaller pieces for vectorization
   */
  private async chunkText(content: string, documentId: string): Promise<Array<{ text: string; metadata: Record<string, any> }>> {
    // Initialize text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    
    // Use createDocuments from the splitter, which returns a Promise
    const docs = await textSplitter.createDocuments([content]);
    
    // Map the documents to our desired format
    return docs.map((doc, index) => ({
      text: doc.pageContent,
      metadata: {
        source: 'Chapter 12.txt',
        documentId,
        chunkIndex: index,
        chapter: 'Chapter 12',
        ...doc.metadata
      }
    }));
  }
  
  /**
   * Query PGVector for similar chunks based on the query
   */
  async queryChapter12(query: string, limit: number = 5): Promise<Array<{ text: string; score: number; metadata: Record<string, any> }>> {
    try {
      const results = await postgresService.similaritySearch(query, limit);
      return results;
    } catch (error) {
      console.error('Error querying Chapter 12 vectors:', error);
      throw new Error('Failed to query Chapter 12 vectors');
    }
  }

  /**
   * Get embedding from Gemini model and ensure proper number array format
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: this.embeddingModel });
      const result = await embeddingModel.embedContent(text);
      
      // Access the embedding values and ensure they're a clean array of numbers
      const values = result.embedding.values;
      
      // Debug the format we're getting
      console.log("Raw embedding type:", typeof values);
      console.log("Raw embedding sample:", JSON.stringify(values).substring(0, 50) + "...");
      
      // Return a clean array of numbers
      if (Array.isArray(values)) {
        return values;
      } else {
        // Handle case where it might be a string or other format
        console.warn("Embedding is not an array, attempting to convert");
        return [];  // Return empty array as fallback (will be obvious in logs)
      }
    } catch (error) {
      console.error('Error getting embedding from Gemini:', error);
      throw error;
    }
  }

  // Generate a mock embedding with proper format for testing
  private generateMockEmbedding(text: string): string {
    // Create a random 768-dimension vector (typical embedding size)
    const mockVector = [];
    for (let i = 0; i < 768; i++) {
      mockVector.push((Math.random() * 2 - 1).toFixed(8));
    }
    return `[${mockVector.join(',')}]`;
  }
}

export default new PgVectorService(); 