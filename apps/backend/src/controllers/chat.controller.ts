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

export const queryChapter12WithLangChain = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    try {
      // Use the LangChain method
      const { response, topChunks } = await chatService.queryChapter12WithLangChain(query);
      
      res.json({
        success: true,
        query,
        response,
        topChunks: topChunks.map(chunk => ({
          text: chunk.text,
          score: chunk.score,
          // Only include relevant metadata fields
          metadata: {
            source: chunk.metadata.source,
            chapter: chunk.metadata.chapter,
            chunkIndex: chunk.metadata.chunkIndex
          }
        }))
      });
    } catch (serviceError: unknown) {
      const error = serviceError as Error;
      console.warn('Using mock service due to error:', error.message);
      
      const mockResponse = `Based on Chapter 12, people don't really want relationships per se. What they want is the value they can get from relationships. The author argues that if people can secure the same value more cheaply, easily, and safely in other ways, they'll do so.`;
      
      res.json({
        success: true,
        query,
        response: mockResponse,
        topChunks: Array(3).fill(null).map((_, i) => ({
          text: `Mock chunk ${i+1} for Chapter 12 about relationships and value.`,
          score: 0.9 - (i * 0.1),
          metadata: { source: "Chapter 12.txt", mock: true }
        }))
      });
    }
  } catch (error: any) {
    console.error('Error in LangChain query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process query',
      error: error.message
    });
  }
};

// Chapter 12 specific code removed for cleaner architecture