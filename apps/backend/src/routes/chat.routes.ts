import express from 'express';
import { chat, queryChapter12WithLangChain } from '../controllers/chat.controller';

const router = express.Router();

// Chat endpoint for interacting with stored documents
router.post('/', chat);

// Add this route
router.post('/chapter12/langchain', queryChapter12WithLangChain);

export default router;