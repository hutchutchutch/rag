import { Request, Response } from 'express';
import documentService from '../services/document.service.js';
import s3Service from '../services/s3.service.js';
import fs from 'fs';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    
    // Process document and store in vector stores
    const { documentId, s3Key } = await documentService.processDocument(filePath);
    
    // Generate pre-signed URL for downloading
    const downloadUrl = await s3Service.getPresignedUrl(s3Key);
    
    // Clean up temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error removing temporary file:', err);
    });
    
    res.status(201).json({
      documentId,
      s3Key,
      downloadUrl,
      message: 'Document processed successfully',
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      error: 'Failed to process document',
      details: error.message,
    });
  }
};

export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const results = await documentService.searchDocuments(
      query,
      typeof limit === 'string' ? parseInt(limit) : 5
    );
    
    res.json({ results });
  } catch (error: any) {
    console.error('Error searching documents:', error);
    res.status(500).json({
      error: 'Failed to search documents',
      details: error.message,
    });
  }
};