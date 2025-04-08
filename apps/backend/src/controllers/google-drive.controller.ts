import { Request, Response } from 'express';
import googleDriveService from '../services/google-drive.service.js';
import documentService from '../services/document.service.js';

/**
 * Get the Google OAuth authorization URL
 */
export const getAuthUrl = (req: Request, res: Response) => {
  try {
    const authUrl = googleDriveService.getAuthUrl();
    res.json({ authUrl });
  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      error: 'Failed to generate authorization URL',
      details: error.message,
    });
  }
};

/**
 * Handle OAuth callback and exchange code for tokens
 */
export const handleAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    // Exchange code for tokens and get user email
    const { tokens, email } = await googleDriveService.setupDriveClient(code);
    
    // Store tokens in session or return to client
    // In a production app, you would store these securely associated with the user
    // For this example, we'll set them in the session
    if (!req.session) {
      req.session = {};
    }
    req.session.googleTokens = tokens;
    req.session.userEmail = email;
    
    // Redirect to frontend or return tokens
    if (req.headers.accept?.includes('application/json')) {
      res.json({ success: true, email });
    } else {
      // Redirect to frontend page that handles authentication completion
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/drive?auth=success&email=${encodeURIComponent(email)}`);
    }
  } catch (error: any) {
    console.error('Error handling auth callback:', error);
    res.status(500).json({
      error: 'Failed to complete Google authorization',
      details: error.message,
    });
  }
};

/**
 * List files from user's Google Drive (Markdown files only)
 */
export const listFiles = async (req: Request, res: Response) => {
  try {
    // Ensure tokens are available
    if (!req.session?.googleTokens) {
      return res.status(401).json({ error: 'Not authenticated with Google Drive' });
    }
    
    // Refresh token if needed
    const refreshedTokens = await googleDriveService.refreshTokenIfNeeded(req.session.googleTokens);
    req.session.googleTokens = refreshedTokens;
    
    // Setup drive client with tokens
    googleDriveService.setTokens(refreshedTokens);
    
    // Get query parameters
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 50;
    const customQuery = req.query.query as string || undefined;
    
    // Get files
    const files = await googleDriveService.listFiles(pageSize, customQuery);
    
    res.json({ files });
  } catch (error: any) {
    console.error('Error listing Google Drive files:', error);
    res.status(500).json({
      error: 'Failed to list Google Drive files',
      details: error.message,
    });
  }
};

/**
 * Import a file from Google Drive, process it through the RAG pipeline
 */
export const importFile = async (req: Request, res: Response) => {
  try {
    // Ensure tokens are available
    if (!req.session?.googleTokens) {
      return res.status(401).json({ error: 'Not authenticated with Google Drive' });
    }
    
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }
    
    // Refresh token if needed
    const refreshedTokens = await googleDriveService.refreshTokenIfNeeded(req.session.googleTokens);
    req.session.googleTokens = refreshedTokens;
    
    // Setup drive client with tokens
    googleDriveService.setTokens(refreshedTokens);
    
    // Download the file
    const filePath = await googleDriveService.downloadFile(fileId);
    
    // Process the document through RAG pipeline
    const { documentId, s3Key } = await documentService.processDocument(filePath);
    
    res.status(201).json({
      documentId,
      s3Key,
      message: 'Document imported and processed successfully',
    });
  } catch (error: any) {
    console.error('Error importing Google Drive file:', error);
    res.status(500).json({
      error: 'Failed to import Google Drive file',
      details: error.message,
    });
  }
};