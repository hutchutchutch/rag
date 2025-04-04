import express from 'express';
import { uploadDocument, searchDocuments } from '../controllers/document.controller.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Upload a document
router.post('/upload', upload.single('document'), uploadDocument);

// Search documents
router.get('/search', searchDocuments);

export default router;