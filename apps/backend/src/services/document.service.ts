import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import s3Service from './s3.service.js';
import neo4jService from './neo4j.service.js';
import postgresService from './postgres.service.js';
import config from '../config/index.js';

// Initialize Markdown parser
const md = new MarkdownIt();

class DocumentService {
  /**
   * Process and store a document in all vector stores
   */
  async processDocument(filePath: string): Promise<{ documentId: string; s3Key: string }> {
    try {
      // Generate unique document ID
      const documentId = uuidv4();
      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName).toLowerCase();
      
      // Determine content type based on file extension
      let contentType = 'text/plain';
      if (fileExt === '.md' || fileExt === '.markdown') {
        contentType = 'text/markdown';
      } else if (fileExt === '.pdf') {
        contentType = 'application/pdf';
      }
      
      // Upload to S3
      const s3Key = await s3Service.uploadFile(filePath, contentType);
      
      // Read and parse the document
      let fileContent = '';
      
      // Handle different file types
      if (fileExt === '.pdf') {
        // For PDF files, we would normally use a PDF parsing library
        // For this implementation, we'll just read the file but in a real app
        // you would use a library like pdf-parse or pdf2json
        console.log('Processing PDF file:', fileName);
        // Mock extraction for demo purposes
        fileContent = `Extracted content from PDF: ${fileName}\n\n` +
                      `This is placeholder text since we're not actually parsing the PDF.\n` +
                      `In a production environment, you would use a PDF parsing library.`;
      } else {
        // For text-based files (markdown, txt)
        fileContent = fs.readFileSync(filePath, 'utf-8');
      }
      
      const chunks = this.chunkDocument(fileContent, fileName);
      
      // Store document metadata in PostgreSQL
      await postgresService.storeDocument(
        documentId,
        this.extractTitle(fileContent) || fileName,
        'upload',
        s3Key
      );
      
      // Store document chunks in both vector stores
      await Promise.all([
        neo4jService.storeDocumentChunks(documentId, chunks),
        postgresService.storeDocumentChunks(documentId, chunks)
      ]);
      
      return { documentId, s3Key };
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
  
  /**
   * Extract title from markdown content
   */
  private extractTitle(content: string): string | null {
    // Look for the first heading in the document
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }
  
  /**
   * Chunk document content for vector storage
   */
  private chunkDocument(
    content: string,
    fileName: string
  ): Array<{ text: string; metadata: Record<string, any> }> {
    // Parse markdown
    const htmlContent = md.render(content);
    
    // Extract the title
    const title = this.extractTitle(content) || fileName;
    
    // Simple chunking by markdown headers
    const sections = content.split(/^#{1,3}\s+/m).filter(Boolean);
    
    // Extract section titles using regex
    const sectionTitles = content.match(/^#{1,3}\s+(.+)$/gm) || [];
    
    return sections.map((section, index) => {
      // Get section title or use placeholder
      const sectionTitle = index < sectionTitles.length 
        ? sectionTitles[index].replace(/^#{1,3}\s+/, '')
        : `Section ${index + 1}`;
      
      return {
        text: section.trim(),
        metadata: {
          title,
          source: 'upload',
          fileName,
          sectionTitle,
          sectionIndex: index,
        }
      };
    });
  }
  
  /**
   * Perform similarity search across both vector stores
   * and combine results
   */
  async searchDocuments(query: string, limit: number = 5): Promise<any[]> {
    try {
      // Search in both vector stores
      const [neo4jResults, pgResults] = await Promise.all([
        neo4jService.similaritySearch(query, limit),
        postgresService.similaritySearch(query, limit)
      ]);
      
      // Combine and deduplicate results
      const combinedResults = [...neo4jResults, ...pgResults];
      const uniqueResults = this.deduplicateResults(combinedResults);
      
      // Sort by relevance score
      return uniqueResults.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
  
  /**
   * Deduplicate search results based on text content
   */
  private deduplicateResults(results: any[]): any[] {
    const seen = new Set();
    return results.filter(result => {
      const key = result.text;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export default new DocumentService();