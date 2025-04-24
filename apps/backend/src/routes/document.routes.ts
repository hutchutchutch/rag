import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDocument, searchDocuments, submitKnowledgeGraph, processChapter12, queryChapter12 } from '../controllers/document.controller.js';
import config from '../config/index.js';

const router = express.Router();
const upload = multer({ dest: config.paths.uploads });


router.get('/', (req, res) => {
  res.send('Hello World');
});

// Document upload
router.post('/upload', upload.single('file'), uploadDocument);

// Document search
router.get('/search', searchDocuments);



// Knowledge Graph submission
router.post('/knowledge-graph/:extractionId', submitKnowledgeGraph);

// Chapter 12 routes
router.post('/chapter12/ingest', processChapter12);
router.post('/chapter12/query', queryChapter12);

export default router;