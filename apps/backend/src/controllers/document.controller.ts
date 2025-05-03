import { Request, Response } from 'express';
import documentService from '../services/document.service.js';
import s3Service from '../services/s3.service.js';
import fs from 'fs';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    console.log('Upload request received:', {
      body: req.body,
      file: req.file,
      files: req.files
    });
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }
    
    const filePath = req.file.path;
    console.log('File saved at:', filePath);
    
    try {
      // Process document and store in vector stores
      const { documentId, s3Key } = await documentService.processDocument(filePath);
      
      // Generate pre-signed URL for downloading
      const downloadUrl = await s3Service.getPresignedUrl(s3Key);
      
      // Clean up temporary file
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error removing temporary file:', err);
      });
      
      res.status(201).json({
        success: true,
        documentId,
        s3Key,
        downloadUrl,
        message: 'Document processed successfully'
      });
    } catch (error) {
      // Clean up temporary file on error
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error removing temporary file:', err);
      });
      
      throw error; // Re-throw to be handled by the outer catch
    }
  } catch (error: any) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process document',
      details: error.message
    });
  }
};

/**
 * Search for documents and optionally generate a knowledge graph proposal
 */
export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const { query, limit = 5, buildKnowledgeGraph = false } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Query parameter is required' 
      });
    }
    
    // Parse limit to integer with fallback
    const limitNum = typeof limit === 'string' ? parseInt(limit) || 5 : 5;
    
    // Search for documents
    const results = await documentService.searchDocuments(query, limitNum);
    
    // Generate knowledge graph if requested
    let knowledgeGraph = undefined;
    if (buildKnowledgeGraph === 'true' && results.length > 0) {
      knowledgeGraph = await documentService.buildKnowledgeGraph(results);
    }
    
    res.json({
      success: true,
      query,
      results,
      knowledgeGraph,
      resultCount: results.length
    });
  } catch (error: any) {
    console.error('Error searching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search documents',
      details: error.message
    });
  }
};

/**
 * Submit edited knowledge graph for storage in Neo4j
 */
export const submitKnowledgeGraph = async (req: Request, res: Response) => {
  try {
    const { extractionId } = req.params;
    const { entities, relationships } = req.body;
    
    if (!extractionId) {
      return res.status(400).json({ error: 'Extraction ID is required' });
    }
    
    if (!entities || !Array.isArray(entities) || !relationships || !Array.isArray(relationships)) {
      return res.status(400).json({ error: 'Valid entities and relationships arrays are required' });
    }
    
    try {
      // Call the service to save knowledge graph to Neo4j
      const result = await documentService.saveKnowledgeGraph(extractionId, entities, relationships);
      
      res.json({
        success: true,
        message: 'Knowledge graph saved successfully',
        extractionId,
        entitiesAdded: result.entitiesAdded,
        relationshipsAdded: result.relationshipsAdded
      });
    } catch (serviceError) {
      console.warn('Knowledge graph save error:', serviceError);
      res.status(500).json({
        error: 'Failed to save knowledge graph',
        details: serviceError.message
      });
    }
  } catch (error: any) {
    console.error('Error submitting knowledge graph:', error);
    res.status(500).json({
      error: 'Failed to process knowledge graph submission',
      details: error.message
    });
  }
};

// Chapter 12 specific code removed for cleaner architecture