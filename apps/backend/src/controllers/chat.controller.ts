import { Request, Response } from 'express';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import chatService from '../services/chat.service.js';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    // Convert chat history to message objects
    const parsedHistory = history.map((msg: any) => {
      switch (msg.type) {
        case 'human':
          return new HumanMessage(msg.content);
        case 'ai':
          return new AIMessage(msg.content);
        case 'system':
          return new SystemMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
    
    // Process the message through the chat service
    const response = await chatService.processMessage(parsedHistory, message);
    
    // Return the updated history with the AI response
    res.json({
      success: true,
      response,
      history: [
        ...history,
        { type: 'human', content: message },
        { type: 'ai', content: response },
      ]
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      details: error.message
    });
  }
};

// Chapter 12 specific code removed for cleaner architecture