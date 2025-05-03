import express from 'express';
import { uploadDocument, searchDocuments, submitKnowledgeGraph } from '../controllers/document.controller.js';
import upload from '../middlewares/upload.middleware.js';
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';

// Ensure uploads directory exists
if (!fs.existsSync(config.paths.uploads)) {
  fs.mkdirSync(config.paths.uploads, { recursive: true });
  console.log(`Created uploads directory at ${config.paths.uploads}`);
}

const router = express.Router();

// Document upload
router.post('/upload', upload.single('file'), uploadDocument);

// Document search
router.get('/search', searchDocuments);

// Knowledge Graph submission
router.post('/knowledge-graph/:extractionId', submitKnowledgeGraph);

export default router;