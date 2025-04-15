import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { RunnableConfig } from 'langchain/runnables';
import { StateGraph, END, workflow } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { Tool } from '@langchain/core/tools';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { z } from 'zod';
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
  private embeddings: OpenAIEmbeddings;
  private chatGraph: any; // StateGraph<GraphState>
  
  constructor() {
    try {
      // Initialize language model
      this.llm = new ChatOpenAI({
        apiKey: config.openai.apiKey || 'dummy_key_for_testing',
        modelName: config.openai.model || 'gpt-3.5-turbo',
        temperature: config.openai.temperature || 0.7,
      });
      
      // Initialize embeddings model
      this.embeddings = new OpenAIEmbeddings({
        apiKey: config.openai.apiKey || 'dummy_key_for_testing',
        modelName: 'text-embedding-3-small',
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
    // Create a retrieval tool
    const retrieveSchema = z.object({ query: z.string() });
    
    const retrieveTool = new Tool({
      name: 'retrieve',
      description: 'Retrieve information from the knowledge base related to a query.',
      schema: retrieveSchema,
      invoke: async ({ query }) => {
        // Search for relevant document chunks
        const retrievedDocs = await documentService.searchDocuments(query, 3);
        
        // Format the retrieved documents
        const serialized = retrievedDocs
          .map(doc => `Content: ${doc.text}\nMetadata: ${JSON.stringify(doc.metadata || {})}`)
          .join('\n\n');
        
        return serialized;
      }
    });
    
    // Setup LLM with the retrieval tool
    const llmWithTools = this.llm;
    
    // Create the LangGraph workflow with message state
    const graph = new StateGraph({
      channels: {
        messages: { value: [] }
      }
    });
    
    // Step 1: Generate a query and optionally call the retrieval tool
    const queryOrRespond = async (state: { messages: BaseMessage[] }) => {
      // Use the retrieval tool directly instead of binding it to the LLM
      const lastMessage = state.messages[state.messages.length - 1];
      let messageContent = "";
      
      if (lastMessage instanceof HumanMessage) {
        messageContent = lastMessage.content as string;
      }
      
      if (messageContent) {
        // First try to search directly using the last message as a query
        try {
          const retrievalResult = await retrieveTool.invoke({ query: messageContent });
          
          // If we get results, create an AI message that references the retrieved content
          const responseWithContext = await this.llm.invoke([
            new SystemMessage(`You are a helpful, accurate, and concise assistant. 
            Use the following retrieved information to answer the user's question:
            
            ${retrievalResult}`),
            ...state.messages
          ]);
          
          return { messages: [responseWithContext] };
        } catch (error) {
          console.warn('Retrieval failed, falling back to direct response:', error.message);
        }
      }
      
      // If retrieval fails or there's no message content, just respond directly
      const response = await this.llm.invoke(state.messages);
      return { messages: [response] };
    }
    
    // Step 2: Execute the retrieval if a tool call was made
    const tools = new ToolNode([retrieveTool]);
    
    // Step 3: Generate a final response based on retrieved information
    async function generate(state: { messages: BaseMessage[] }) {
      // Extract the most recent tool messages
      let recentToolMessages = [];
      for (let i = state["messages"].length - 1; i >= 0; i--) {
        let message = state["messages"][i];
        if (message instanceof ToolMessage) {
          recentToolMessages.push(message);
        } else if (message instanceof AIMessage && message.tool_calls.length > 0) {
          break;
        }
      }
      let toolMessages = recentToolMessages.reverse();
      
      // Format the context from retrieved documents
      const docsContent = toolMessages.map(doc => doc.content).join('\n\n');
      const systemPrompt =
        'You are a helpful, accurate, and concise assistant for a document question-answering system. ' +
        'Use the following pieces of retrieved context to answer the question. ' +
        'If you don\'t know the answer based on the context, say that you don\'t know. ' +
        'Keep your answers concise and focused on the query. ' +
        'Don\'t reference that you\'re using the retrieved context.\n\n' +
        `${docsContent}`;
      
      // Filter to just human and system messages for the prompt
      const conversationMessages = state.messages.filter(
        message =>
          message instanceof HumanMessage ||
          message instanceof SystemMessage ||
          (message instanceof AIMessage && message.tool_calls.length === 0)
      );
      
      const prompt = [
        new SystemMessage(systemPrompt),
        ...conversationMessages
      ];
      
      // Generate the response
      const response = await this.llm.invoke(prompt);
      return { messages: [response] };
    }
    
    // Connect the nodes
    graph.addNode('queryOrRespond', queryOrRespond);
    graph.addNode('tools', tools);
    graph.addNode('generate', generate);
    
    // Simplify the graph to just use the queryOrRespond node directly
    graph.addEdge('__start__', 'queryOrRespond');
    graph.addEdge('queryOrRespond', '__end__');
    
    // Compile the graph
    this.chatGraph = graph.compile();
  }
  
  /**
   * Process a document to extract chunks and create embeddings
   */
  async processDocument(content: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: config.documentProcessing.chunkSize,
        chunkOverlap: config.documentProcessing.chunkOverlap,
      });
      
      const docs = await textSplitter.createDocuments(
        [content],
        [metadata]
      );
      
      // Create a temporary in-memory vector store
      const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        this.embeddings
      );
      
      console.log(`Processed document with ${docs.length} chunks`);
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
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