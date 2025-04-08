import express from 'express';
import { getAuthUrl, handleAuthCallback, listFiles, importFile } from '../controllers/google-drive.controller.js';

const router = express.Router();

// Get Google OAuth URL
router.get('/auth', getAuthUrl);

// Handle OAuth callback
router.get('/auth/callback', handleAuthCallback);

// List files from Google Drive
router.get('/files', listFiles);

// Import a file from Google Drive
router.post('/import', importFile);

export default router;