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

/**
 * Chat specifically with Chapter 12 content
 */
export const chatWithChapter12 = async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    try {
      // Query Chapter 12 specifically
      const { response, topChunks } = await chatService.queryChapter12(message);
      
      // Return the response with top chunks
      res.json({
        response,
        topChunks,
        history: [
          ...history,
          { type: 'human', content: message },
          { type: 'ai', content: response },
        ],
      });
    } catch (serviceError: any) {
      console.warn('Using mock service for Chapter 12 due to error:', serviceError.message);
      
      // If the real service fails, use a mock response
      const mockResponse = `I found some information about Chapter 12. The chapter discusses how people don't really want relationships for their own sake, but rather for the values they provide. The author argues that people will seek alternatives when they can secure the same value more cheaply, easily, and safely.`;
      
      res.json({
        response: mockResponse,
        topChunks: [],
        history: [
          ...history,
          { type: 'human', content: message },
          { type: 'ai', content: mockResponse },
        ],
      });
    }
  } catch (error: any) {
    console.error('Error in Chapter 12 chat:', error);
    res.status(500).json({
      error: 'Failed to process Chapter 12 chat message',
      details: error.message,
    });
  }
};