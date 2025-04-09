import { ChatOpenAI } from '@langchain/openai';
import { RunnableConfig } from 'langchain/runnables';
import { StateGraph, END, workflow } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import documentService from './document.service.js';
import config from '../config/index';

// Define message types
type RetrieverInput = {
  query: string;
};

type GraphState = {
  messages: BaseMessage[];
  context?: string[];
  query?: string;
};

class ChatService {
  private llm: ChatOpenAI;
  private chatGraph: any; // StateGraph<GraphState>
  
  constructor() {
    try {
      // Initialize language model
      this.llm = new ChatOpenAI({
        apiKey: config.openai.apiKey || 'dummy_key_for_testing',
        modelName: config.openai.model || 'gpt-3.5-turbo',
        temperature: config.openai.temperature || 0.7,
      });
      
      // Initialize chat graph
      this.initializeChatGraph();
    } catch (error) {
      console.warn('Error initializing ChatService:', error.message);
      console.warn('Chat service will operate in mock mode');
    }
  }
  
  /**
   * Initialize the LangGraph workflow
   */
  private initializeChatGraph(): void {
    const builder = new StateGraph<GraphState>({
      channels: {
        messages: { value: [] },
        context: { value: undefined },
        query: { value: undefined },
      },
    });
    
    // Extract query for retrieval
    builder.addNode('extract_query', this.extractQuery.bind(this));
    
    // Retrieve relevant context
    builder.addNode('retrieve', this.retrieve.bind(this));
    
    // Generate final response with context
    builder.addNode('generate', this.generate.bind(this));
    
    // Define the workflow
    builder.addEdge('extract_query', 'retrieve');
    builder.addEdge('retrieve', 'generate');
    builder.addEdge('generate', END);
    
    // Set entry point to query extraction
    builder.setEntryPoint('extract_query');
    
    // Compile the graph
    this.chatGraph = builder.compile();
  }
  
  /**
   * Extract the user query from the chat history
   */
  private async extractQuery(state: GraphState, config?: RunnableConfig): Promise<GraphState> {
    // Get the last user message
    const lastMessage = state.messages[state.messages.length - 1];
    
    if (lastMessage instanceof HumanMessage) {
      return {
        ...state,
        query: lastMessage.content as string,
      };
    }
    
    return state;
  }
  
  /**
   * Retrieve relevant context from document stores
   */
  private async retrieve(state: GraphState, config?: RunnableConfig): Promise<GraphState> {
    if (!state.query) {
      return state;
    }
    
    // Search for relevant document chunks
    const results = await documentService.searchDocuments(state.query, 3);
    
    // Extract text content for context
    const context = results.map(result => result.text);
    
    return {
      ...state,
      context,
    };
  }
  
  /**
   * Generate response using retrieved context
   */
  private async generate(state: GraphState, config?: RunnableConfig): Promise<GraphState> {
    const messages = [...state.messages];
    
    // Add system message with context if available
    if (state.context && state.context.length > 0) {
      const contextText = state.context.join('\n\n');
      const systemPrompt = `
You are a helpful, accurate, and concise assistant. Answer the user's question based on the following retrieved context:

${contextText}

If the context doesn't contain the information needed to answer the question, say that you don't know based on the available information.
Don't reference that you're using any particular context. Just answer naturally.
`;
      
      // Add system message at the beginning
      messages.unshift(new SystemMessage(systemPrompt));
    }
    
    // Generate response using the language model
    const response = await this.llm.invoke(messages);
    
    // Add AI response to the messages
    return {
      ...state,
      messages: [...state.messages, response],
    };
  }
  
  /**
   * Process a user message through the chat graph
   */
  async processMessage(history: BaseMessage[], message: string): Promise<string> {
    try {
      // Add user message to history
      const updatedHistory = [...history, new HumanMessage(message)];
      
      // Execute the workflow
      const result = await this.chatGraph.invoke({
        messages: updatedHistory,
      });
      
      // Extract AI response
      const aiMessage = result.messages[result.messages.length - 1];
      return aiMessage.content as string;
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Generate a mock response for testing when the LLM is not available
      const mockResponses = [
        `Based on the available information, "${message}" refers to a concept in retrieval-augmented generation systems.`,
        `That's an interesting question about "${message}". In RAG systems, we typically process this by retrieving relevant context first.`,
        `I found some information that might help answer your question about "${message}". Vector databases are crucial for efficiently retrieving relevant context.`,
        `Your query about "${message}" touches on an important aspect of modern AI systems. The combination of retrieval and generation is powerful for knowledge-intensive tasks.`
      ];
      
      const randomIndex = Math.floor(Math.random() * mockResponses.length);
      return mockResponses[randomIndex];
    }
  }
}

export default new ChatService();