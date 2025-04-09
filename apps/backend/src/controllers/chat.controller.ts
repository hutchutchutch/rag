import { Request, Response } from 'express';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import chatService from '../services/chat.service.js';
import mockService from '../services/mock.service.js';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
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
    
    // Process the message through the chat graph
    try {
      // Try to use the real chat service
      const response = await chatService.processMessage(parsedHistory, message);
      
      // Return the updated history with the AI response
      res.json({
        response,
        history: [
          ...history,
          { type: 'human', content: message },
          { type: 'ai', content: response },
        ],
      });
    } catch (serviceError) {
      console.warn('Using mock service due to service error:', serviceError.message);
      
      // Use the mock service for chat responses
      const mockResponse = await mockService.processMessage(parsedHistory, message);
      
      res.json({
        response: mockResponse,
        history: [
          ...history,
          { type: 'human', content: message },
          { type: 'ai', content: mockResponse },
        ],
      });
    }
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message,
    });
  }
};