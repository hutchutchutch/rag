import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { Tool } from '@langchain/core/tools';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { z } from 'zod';
import documentService from './document.service.js';
import neo4jService from './neo4j.service.js';
import postgresService from './postgres.service.js';
import config from '../config/index';
import pgVectorService from './pg-vector.service.js';

// Define ChatRagState for the chat+rag agentic graph
class ChatRagState extends z.ZodObject<{
  question: z.ZodString,
  chat_history: z.ZodArray<z.ZodAny, "many">,
  retrieved_documents: z.ZodArray<z.ZodObject<any>, "many">,
  context: z.ZodArray<z.ZodString, "many">,
  response: z.ZodOptional<z.ZodString>,
  search_type: z.ZodEnum<["vector", "graph", "hybrid"]>, 
  subqueries: z.ZodOptional<z.ZodArray<z.ZodString, "many">>,
  cypher_query: z.ZodOptional<z.ZodString>,
}> {
  static create() {
    return z.object({
      question: z.string(),
      chat_history: z.array(z.any()),
      retrieved_documents: z.array(z.object({
        text: z.string(),
        metadata: z.record(z.any()).optional(),
        score: z.number().optional(),
      })),
      context: z.array(z.string()),
      response: z.string().optional(),
      search_type: z.enum(["vector", "graph", "hybrid"]),
      subqueries: z.array(z.string()).optional(),
      cypher_query: z.string().optional()
    });
  }
}

// Define KnowledgeGraphState for the knowledge graph builder agentic graph
class KnowledgeGraphState extends z.ZodObject<{
  chunks: z.ZodArray<z.ZodObject<any>, "many">,
  existing_schema: z.ZodObject<any>,
  extracted_entities: z.ZodArray<z.ZodObject<any>, "many">,
  extracted_relationships: z.ZodArray<z.ZodObject<any>, "many">,
  pending_approvals: z.ZodArray<z.ZodAny, "many">,
  user_approved: z.ZodBoolean,
  merged_data: z.ZodOptional<z.ZodObject<any>>,
  extraction_id: z.ZodString
}> {
  static create() {
    return z.object({
      chunks: z.array(z.object({
        text: z.string(),
        metadata: z.record(z.any()).optional(),
      })),
      existing_schema: z.object({
        labels: z.array(z.string()),
        relationships: z.array(z.string()),
        properties: z.array(z.string()).optional()
      }),
      extracted_entities: z.array(z.object({
        name: z.string(),
        label: z.string(),
        isNew: z.boolean().optional()
      })),
      extracted_relationships: z.array(z.object({
        source: z.string(),
        target: z.string(),
        type: z.string()
      })),
      pending_approvals: z.array(z.any()),
      user_approved: z.boolean(),
      merged_data: z.object({
        entities_added: z.number(),
        relationships_added: z.number()
      }).optional(),
      extraction_id: z.string()
    });
  }
}

class ChatService {
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private chatRagGraph: any; // StateGraph<ChatRagState>
  private knowledgeGraphBuilder: any; // StateGraph<KnowledgeGraphState>
  
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
      
      // Initialize both agentic graphs
      this.initializeChatRagGraph();
      this.initializeKnowledgeGraphBuilder();
    } catch (error) {
      console.warn('Error initializing ChatService:', error.message);
      console.warn('Chat service will operate in mock mode');
    }
  }
  
  /**
   * Initialize the ChatRag agentic graph with vector and graph query paths
   */
  private initializeChatRagGraph(): void {
    // Create a graph workflow
    const graphWorkflow = new StateGraph(ChatRagState.create());

    // Router node to determine search type based on question
    const determineSearchType = async (state: any) => {
      const question = state.question;
      
      // Simple routing logic - could be replaced with an LLM-based router
      const vectorKeywords = ['similar', 'like', 'related', 'relevant'];
      const graphKeywords = ['connect', 'relationship', 'linked', 'related to'];
      
      const needsVectorSearch = vectorKeywords.some(keyword => 
        question.toLowerCase().includes(keyword)
      );
      
      const needsGraphSearch = graphKeywords.some(keyword => 
        question.toLowerCase().includes(keyword)
      );
      
      let searchType = "vector"; // Default
      
      if (needsVectorSearch && needsGraphSearch) {
        searchType = "hybrid";
      } else if (needsGraphSearch) {
        searchType = "graph";
      }
      
      return {
        ...state,
        search_type: searchType
      };
    };

    // Node: Retrieve documents based on vector search
    const retrieveDocuments = async (state: any) => {
      try {
        // Use the postgres service for vector search
        const results = await postgresService.similaritySearch(state.question, 5);
        
        return {
          ...state,
          retrieved_documents: results
        };
      } catch (error) {
        console.error("Error in vector search:", error);
        return {
          ...state,
          retrieved_documents: []
        };
      }
    };
    
    // Node: Break down complex queries into subqueries
    const generateSubqueries = async (state: any) => {
      if (state.search_type !== "vector" && state.search_type !== "hybrid") {
        return state; // Skip if not doing vector search
      }
      
      const systemPrompt = `You are a helpful assistant that breaks down complex questions into simpler subqueries.
      For the given question, generate 1-3 simple subqueries that would help answer it.`;
      
      const prompt = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`Break down this question: ${state.question}`)
      ];
      
      const response = await this.llm.invoke(prompt);
      const responseText = response.content.toString();
      
      // Extract subqueries using simple parsing
      const subqueries = responseText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.endsWith('?') || line.length > 15)
        .slice(0, 3); // Take at most 3 subqueries
      
      return {
        ...state,
        subqueries: subqueries.length > 0 ? subqueries : [state.question]
      };
    };
    
    // Node: Perform enhanced vector search using subqueries
    const vectorSearch = async (state: any) => {
      if (state.search_type !== "vector" && state.search_type !== "hybrid") {
        return state; // Skip if not doing vector search
      }
      
      const queries = state.subqueries || [state.question];
      let allResults = [];
      
      // Process each subquery
      for (const query of queries) {
        try {
          // Search in PostgreSQL with pgvector
          const results = await postgresService.similaritySearch(query, 3);
          
          if (results && results.length > 0) {
            allResults.push(...results);
          }
        } catch (error) {
          console.error(`Error in vector search for query "${query}":`, error);
        }
      }
      
      // Deduplicate results by content
      const seenContent = new Set();
      const uniqueResults = allResults.filter(result => {
        if (seenContent.has(result.text)) {
          return false;
        }
        seenContent.add(result.text);
        return true;
      });
      
      // Format results for context
      const context = uniqueResults.map(result => 
        `DOCUMENT: ${result.metadata?.title || 'Untitled'}\nCONTENT: ${result.text}\nSCORE: ${result.score || 'N/A'}`
      );
      
      return {
        ...state,
        retrieved_documents: uniqueResults,
        context: [...(state.context || []), ...context]
      };
    };
    
    // Node: Generate Cypher query from user question
    const generateCypherQuery = async (state: any) => {
      if (state.search_type !== "graph" && state.search_type !== "hybrid") {
        return state; // Skip if not doing graph search
      }
      
      const systemPrompt = `You are a Neo4j graph database expert. Convert user questions into Cypher queries.
      
      The database contains:
      - Document nodes with properties: id, title, source
      - DocumentChunk nodes with properties: id, text, embedding
      - Entity nodes with various labels and a name property
      - CONTAINS relationships between Document and DocumentChunk nodes
      - Various relationships between Entity nodes
      
      Generate a valid Cypher query to answer the user's question.`;
      
      const prompt = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`Generate a Cypher query for this question: ${state.question}`)
      ];
      
      const response = await this.llm.invoke(prompt);
      
      // Extract Cypher query from LLM response
      let cypherQuery = response.content.toString();
      
      // Simple regex extraction if the LLM wraps the query in backticks
      const queryMatch = cypherQuery.match(/```cypher\s*([\s\S]*?)\s*```/) || 
                       cypherQuery.match(/```\s*([\s\S]*?)\s*```/) ||
                       cypherQuery.match(/`([\s\S]*?)`/);
      
      if (queryMatch && queryMatch[1]) {
        cypherQuery = queryMatch[1].trim();
      }
      
      return { 
        ...state,
        cypher_query: cypherQuery
      };
    };
    
    // Node: Execute Cypher query against Neo4j
    const executeCypherQuery = async (state: any) => {
      if (state.search_type !== "graph" && state.search_type !== "hybrid") {
        return state; // Skip if not doing graph search
      }
      
      const cypherQuery = state.cypher_query;
      
      if (!cypherQuery) {
        return { 
          ...state,
          context: [...(state.context || []), "No valid Cypher query was generated."]
        };
      }
      
      const session = neo4jService.driver.session();
      try {
        const result = await session.run(cypherQuery);
        
        // Format Neo4j results as context
        const formattedResults = result.records.map(record => {
          const obj = {};
          record.keys.forEach(key => {
            // Handle Neo4j types appropriately
            const value = record.get(key);
            if (value && typeof value === 'object' && value.properties) {
              // Node objects
              obj[key] = value.properties;
            } else {
              // Primitive values
              obj[key] = value;
            }
          });
          return JSON.stringify(obj);
        }).join('\n');
        
        return { 
          ...state,
          context: [...(state.context || []), formattedResults || "No results found from the Cypher query."]
        };
      } catch (error) {
        console.error("Error executing Cypher query:", error);
        return {
          ...state,
          context: [...(state.context || []), `Error executing query: ${error.message}`]
        };
      } finally {
        await session.close();
      }
    };
    
    // Node: Generate the final response
    const generateResponse = async (state: any) => {
      const context = state.context || [];
      const contextText = context.join('\n\n');
      const chatHistory = state.chat_history || [];
      
      // Format chat history
      const formattedHistory = chatHistory
        .filter((msg: any) => msg instanceof HumanMessage || msg instanceof AIMessage)
        .map((msg: any) => {
          const role = msg instanceof HumanMessage ? "Human" : "AI";
          return `${role}: ${msg.content}`;
        })
        .join('\n');
      
      // Create system prompt with context and chat history
      const systemPrompt = `You are a helpful assistant that answers questions based on the provided context and chat history.
      If the context doesn't contain sufficient information to answer the question, acknowledge that.
      Don't mention that you're using context in your response.
      
      Previous conversation:
      ${formattedHistory}
      
      Context:
      ${contextText}`;
      
      const prompt = [
        new SystemMessage(systemPrompt),
        new HumanMessage(state.question)
      ];
      
      const response = await this.llm.invoke(prompt);
      
      return {
        ...state,
        response: response.content.toString()
      };
    };

    // Add nodes to the graph
    graphWorkflow.addNode("determine_search_type", determineSearchType);
    graphWorkflow.addNode("retrieve_documents", retrieveDocuments);
    graphWorkflow.addNode("generate_subqueries", generateSubqueries);
    graphWorkflow.addNode("vector_search", vectorSearch);
    graphWorkflow.addNode("generate_cypher_query", generateCypherQuery);
    graphWorkflow.addNode("execute_cypher_query", executeCypherQuery);
    graphWorkflow.addNode("generate_response", generateResponse);
    
    // Connect with edges
    graphWorkflow.addEdge("__start__", "determine_search_type");
    graphWorkflow.addEdge("determine_search_type", "retrieve_documents");
    graphWorkflow.addEdge("retrieve_documents", "generate_subqueries");
    graphWorkflow.addEdge("generate_subqueries", "vector_search");
    graphWorkflow.addEdge("vector_search", "generate_cypher_query");
    graphWorkflow.addEdge("generate_cypher_query", "execute_cypher_query");
    graphWorkflow.addEdge("execute_cypher_query", "generate_response");
    graphWorkflow.addEdge("generate_response", END);
    
    // Compile the graph
    this.chatRagGraph = graphWorkflow.compile();
  }
  
  /**
   * Initialize the Knowledge Graph Builder agentic graph
   */
  private initializeKnowledgeGraphBuilder(): void {
    // Create a graph workflow
    const graphWorkflow = new StateGraph(KnowledgeGraphState.create());
    
    // Node 1: Load existing Neo4j schema
    const loadSchema = async (state: any) => {
      console.log("Loading existing Neo4j schema from Neo4j...");
      
      const session = neo4jService.driver.session();
      try {
        // Query for node labels
        const labelsResult = await session.run(`
          CALL db.labels() YIELD label
          RETURN collect(label) as labels
        `);
        
        // Query for relationship types
        const relsResult = await session.run(`
          CALL db.relationshipTypes() YIELD relationshipType
          RETURN collect(relationshipType) as relationshipTypes
        `);
        
        // Query for property keys (optional)
        const propsResult = await session.run(`
          CALL db.propertyKeys() YIELD propertyKey
          RETURN collect(propertyKey) as propertyKeys
        `);
        
        const schema = {
          labels: labelsResult.records[0].get('labels'),
          relationships: relsResult.records[0].get('relationshipTypes'),
          properties: propsResult.records[0].get('propertyKeys')
        };
        
        return { 
          ...state,
          existing_schema: schema 
        };
      } catch (error) {
        console.error("Error loading Neo4j schema:", error);
        // Return a default schema if we can't query the actual schema
        return { 
          ...state,
          existing_schema: {
            labels: ["Document", "DocumentChunk", "Entity", "Concept"],
            relationships: ["CONTAINS", "MENTIONS", "RELATED_TO"],
            properties: ["id", "text", "name", "type"]
          }
        };
      } finally {
        await session.close();
      }
    };
    
    // Node 2: Extract entities and relationships from chunks
    const extractEntities = async (state: any) => {
      console.log("Extracting entities and relationships from document chunks...");
      
      const { chunks, existing_schema } = state;
      
      // Skip if no chunks provided
      if (!chunks || chunks.length === 0) {
        return {
          ...state,
          extracted_entities: [],
          extracted_relationships: []
        };
      }
      
      // Combine chunks into a single text for context
      const context = chunks.map(chunk => chunk.text).join("\n\n").substring(0, 8000); // Limit context size
      
      // Prepare a prompt for entity and relationship extraction
      const knownLabels = existing_schema.labels || ["Document", "Entity", "Concept"];
      const knownRelationships = existing_schema.relationships || ["CONTAINS", "RELATED_TO"];
      
      const systemPrompt = `You are a knowledge graph extraction expert. 
      Extract entities and relationships from the provided text.
      
      Known entity types: ${knownLabels.join(", ")}
      Known relationship types: ${knownRelationships.join(", ")}
      
      For each entity, provide:
      - name: The canonical name of the entity
      - label: The type/category from the known types (or suggest a new one)
      
      For each relationship, provide:
      - source: Name of the source entity
      - target: Name of the target entity
      - type: Relationship type from known types (or suggest a new one)
      
      Return the results in JSON format with format:
      {
        "entities": [{"name": "...", "label": "..."}],
        "relationships": [{"source": "...", "target": "...", "type": "..."}]
      }`;
      
      try {
        // Use LLM to extract entities and relationships
        const result = await this.llm.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(`Extract entities and relationships from this text:\n\n${context}`)
        ]);
        
        // Parse the LLM response to extract JSON
        const response = result.content.toString();
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/```\s*([\s\S]*?)\s*```/) ||
                        response.match(/\{[\s\S]*\}/);
        
        let entities = [];
        let relationships = [];
        
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[0]);
            entities = parsedData.entities || [];
            relationships = parsedData.relationships || [];
          } catch (parseError) {
            console.error("Error parsing LLM JSON response:", parseError);
          }
        }
        
        // Add isNew flag to all entities (will be verified in next node)
        entities = entities.map(entity => ({
          ...entity,
          isNew: true // Assume new until proven otherwise
        }));
        
        return {
          ...state,
          extracted_entities: entities,
          extracted_relationships: relationships
        };
      } catch (error) {
        console.error("Error extracting entities:", error);
        return {
          ...state,
          extracted_entities: [],
          extracted_relationships: []
        };
      }
    };
    
    // Node 3: Check if entities already exist in Neo4j
    const checkEntities = async (state: any) => {
      console.log("Checking extracted entities against Neo4j database...");
      
      const { extracted_entities } = state;
      
      if (!extracted_entities || extracted_entities.length === 0) {
        return state;
      }
      
      const session = neo4jService.driver.session();
      let verifiedEntities = [...extracted_entities];
      
      try {
        // Check each entity in Neo4j
        for (let i = 0; i < verifiedEntities.length; i++) {
          const entity = verifiedEntities[i];
          
          // Check if entity with this name already exists
          const checkResult = await session.run(
            `MATCH (e {name: $name}) RETURN e`,
            { name: entity.name }
          );
          
          // If results found, mark entity as not new
          if (checkResult.records.length > 0) {
            verifiedEntities[i] = {
              ...entity,
              isNew: false
            };
          }
        }
        
        return {
          ...state,
          extracted_entities: verifiedEntities
        };
      } catch (error) {
        console.error("Error checking entities in Neo4j:", error);
        return state; // Return unchanged state on error
      } finally {
        await session.close();
      }
    };
    
    // Node 4: Identify schema changes for user review
    const identifySchemaChanges = async (state: any) => {
      const { extracted_entities, extracted_relationships, existing_schema } = state;
      
      // Check for new entity types (labels) or relationship types
      const newEntityTypes = extracted_entities
        .map(e => e.label)
        .filter(label => !existing_schema.labels.includes(label));
        
      const newRelationshipTypes = extracted_relationships
        .map(r => r.type)
        .filter(type => !existing_schema.relationships.includes(type));
      
      // Create pending approvals for UI presentation
      const pendingApprovals = [
        ...newEntityTypes.map(t => ({ type: 'entity_label', value: t })),
        ...newRelationshipTypes.map(t => ({ type: 'relationship_type', value: t }))
      ];
      
      return {
        ...state,
        pending_approvals: pendingApprovals
      };
    };
    
    // Node 5: Prepare results for user review - terminal node
    const prepareForUserReview = async (state: any) => {
      // This is the end of the extraction flow
      // The UI will handle showing the results to the user
      return state;
    };
    
    // Add nodes to the graph
    graphWorkflow.addNode("load_schema", loadSchema);
    graphWorkflow.addNode("extract_entities", extractEntities);
    graphWorkflow.addNode("check_entities", checkEntities);
    graphWorkflow.addNode("identify_schema_changes", identifySchemaChanges);
    graphWorkflow.addNode("prepare_for_user_review", prepareForUserReview);
    
    // Connect with edges
    graphWorkflow.addEdge("__start__", "load_schema");
    graphWorkflow.addEdge("load_schema", "extract_entities");
    graphWorkflow.addEdge("extract_entities", "check_entities");
    graphWorkflow.addEdge("check_entities", "identify_schema_changes");
    graphWorkflow.addEdge("identify_schema_changes", "prepare_for_user_review");
    graphWorkflow.addEdge("prepare_for_user_review", END);
    
    // Compile the graph
    this.knowledgeGraphBuilder = graphWorkflow.compile();
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
   * Process a user message through the chat RAG graph
   */
  async processMessage(history: BaseMessage[], message: string): Promise<string> {
    try {
      // Execute the chat+rag workflow
      const result = await this.chatRagGraph.invoke({
        question: message,
        chat_history: history,
        retrieved_documents: [],
        context: [],
        search_type: "vector", // default type
      });
      
      // Return the response
      return result.response || "I'm sorry, I couldn't generate a response.";
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
  
  /**
   * Build knowledge graph from search results using the dedicated graph
   */
  async buildKnowledgeGraph(searchResults: any[]): Promise<any> {
    if (!searchResults || searchResults.length === 0) {
      console.warn("No search results provided for knowledge graph building");
      return { 
        entities: [], 
        relationships: [],
        newSchemaElements: [],
        extractionId: `kg-empty-${Date.now()}`,
        user_approved: false
      };
    }
    
    // Create chunks from search results
    const chunks = searchResults.map(result => ({
      text: result.text,
      metadata: result.metadata || {}
    }));
    
    try {
      // Generate unique extraction ID
      const extractionId = `kg-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // Execute the knowledge graph builder workflow
      const result = await this.knowledgeGraphBuilder.invoke({
        chunks: chunks,
        existing_schema: {
          labels: [],
          relationships: [],
          properties: []
        },
        extracted_entities: [],
        extracted_relationships: [],
        pending_approvals: [],
        user_approved: false,
        extraction_id: extractionId
      });
      
      return {
        entities: result.extracted_entities || [],
        relationships: result.extracted_relationships || [],
        newSchemaElements: result.pending_approvals || [],
        extractionId: result.extraction_id,
        user_approved: false
      };
    } catch (error) {
      console.error("Error building knowledge graph:", error);
      return { 
        entities: [], 
        relationships: [],
        newSchemaElements: [],
        extractionId: `kg-error-${Date.now()}`,
        user_approved: false
      };
    }
  }
  
  /**
   * Save user-approved knowledge graph to Neo4j
   */
  async saveKnowledgeGraph(extractionId: string, entities: any[], relationships: any[]): Promise<any> {
    if (!entities || !relationships) {
      throw new Error("Both entities and relationships must be provided");
    }
    
    const session = neo4jService.driver.session();
    
    try {
      // Create or merge entities
      for (const entity of entities) {
        await session.run(
          `
          MERGE (e:${entity.label} {name: $name})
          SET e.lastUpdated = datetime()
          RETURN e
          `,
          { name: entity.name }
        );
      }
      
      // Create or merge relationships
      for (const rel of relationships) {
        await session.run(
          `
          MATCH (source {name: $sourceName})
          MATCH (target {name: $targetName})
          MERGE (source)-[r:${rel.type}]->(target)
          SET r.lastUpdated = datetime()
          RETURN r
          `,
          { 
            sourceName: rel.source,
            targetName: rel.target
          }
        );
      }
      
      return {
        success: true,
        extractionId,
        entities_added: entities.length,
        relationships_added: relationships.length
      };
    } catch (error) {
      console.error("Error saving knowledge graph to Neo4j:", error);
      throw new Error(`Failed to save knowledge graph: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * Query the vector store using LangChain and return top chunks with a response
   */
  async queryChapter12WithLangChain(query: string): Promise<{
    response: string;
    topChunks: Array<{ text: string; score: number; metadata: any }>;
  }> {
    try {
      // 1. Get top chunks from postgres using existing method
      const chunks = await postgresService.similaritySearch(query, 5);
      
      // 2. Format chunks for better context
      const formattedChunks = chunks
        .map((chunk, i) => 
          `[Chunk ${i+1} - Score: ${chunk.score.toFixed(2)}]\n${chunk.text}\n`
        )
        .join("\n");
      
      // 3. Use LangChain to generate a response based on these chunks
      const prompt = ChatPromptTemplate.fromTemplate(`
        You are an assistant that answers questions about Chapter 12 of the book.
        Use only the information in the provided chunks to answer the question.
        If you don't know the answer based on the chunks, say so.
        
        Here are the relevant chunks from Chapter 12:
        
        {context}
        
        Question: {question}
      `);
      
      // Create a simple LangChain chain
      const chain = prompt
        .pipe(this.llm as any)
        .pipe((output: any) => {
          if ('content' in output) {
            return output.content;
          }
          if (Array.isArray(output)) {
            return output.map(msg => msg.content).join('\n');
          }
          return String(output);
        })
        .pipe(new StringOutputParser());

      // Run the chain with our chunks as context
      const chainResult = await chain.invoke({
        context: formattedChunks,
        question: query
      });
      
      return {
        response: chainResult,
        topChunks: chunks
      };
    } catch (error) {
      console.error("Error querying Chapter 12 with LangChain:", error);
      throw new Error("Failed to query Chapter 12 with LangChain");
    }
  }
}

export default new ChatService();