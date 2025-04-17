import express from 'express';
import { uploadDocument, searchDocuments, submitKnowledgeGraph } from '../controllers/document.controller.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Upload a document
router.post('/upload', upload.single('document'), uploadDocument);

// Search documents
router.get('/search', searchDocuments);

// Submit edited knowledge graph
router.post('/knowledge-graph/:extractionId', submitKnowledgeGraph);

export default router;