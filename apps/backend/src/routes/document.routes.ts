import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDocument, searchDocuments, submitKnowledgeGraph } from '../controllers/document.controller.js';
import config from '../config/index.js';

const router = express.Router();
const upload = multer({ dest: config.paths.uploads });

// Document upload
router.post('/upload', upload.single('file'), uploadDocument);

// Document search
router.get('/search', searchDocuments);

// Knowledge Graph submission
router.post('/knowledge-graph/:extractionId', submitKnowledgeGraph);

export default router;