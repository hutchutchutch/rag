import express from 'express';
import { chat, chatWithChapter12 } from '../controllers/chat.controller';

const router = express.Router();

// Regular chat endpoint
router.post('/', chat);

// Chapter 12 specific chat endpoint
router.post('/chapter12', chatWithChapter12);

export default router;