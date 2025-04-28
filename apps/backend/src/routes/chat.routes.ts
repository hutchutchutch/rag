import express from 'express';
import { chat } from '../controllers/chat.controller';

const router = express.Router();

// Chat endpoint for interacting with stored documents
router.post('/', chat);

export default router;