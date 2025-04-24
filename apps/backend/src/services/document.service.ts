import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import { StateGraph, END } from '@langchain/langgraph';
import { z } from 'zod';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import s3Service from './s3.service.js';
import neo4jService from './neo4j.service.js';
import postgresService from './postgres.service.js';
import config from '../config/index.js';
import pgVectorService from './pg-vector.service.js';

// Initialize Markdown parser
const md = new MarkdownIt();

// Define KnowledgeGraph state for LangGraph workflow
class KnowledgeGraphState extends z.ZodObject<{
  chunks: z.ZodArray<z.ZodString, "many">,
  existingSchema: z.ZodRecord<z.ZodString, z.ZodAny>,
  extractedEntities: z.ZodArray<z.ZodObject<any>, "many">,
  extractedRels: z.ZodArray<z.ZodObject<any>, "many">,
  pendingApprovals: z.ZodArray<z.ZodAny, "many">,
}> {
  static create() {
    return z.object({
      chunks: z.array(z.string()),
      existingSchema: z.record(z.any()),
      extractedEntities: z.array(z.object({
        name: z.string(),
        label: z.string(),
        isNew: z.boolean().optional()
      })),
      extractedRels: z.array(z.object({
        source: z.string(),
        target: z.string(),
        type: z.string()
      })),
      pendingApprovals: z.array(z.any())
    });
  }
}

class DocumentService {
  private llm: ChatOpenAI;
  private knowledgeGraphFlow: any; // StateGraph for knowledge graph building

  constructor() {
    // Initialize LLM for entity extraction
    this.llm = new ChatOpenAI({
      apiKey: config.openai.apiKey || 'dummy_key_for_testing',
      modelName: config.openai.model || 'gpt-3.5-turbo',
      temperature: 0.2, // Lower temperature for more precise extraction
    });
    
    // Initialize the knowledge graph building flow
    this.initializeKnowledgeGraphFlow();
  }

  /**
   * Initialize the LangGraph workflow for knowledge graph building
   */
  private initializeKnowledgeGraphFlow(): void {
    // Create the graph workflow
    // const graphWorkflow = new StateGraph(KnowledgeGraphState.create());
    // Make sure schema is defined before creating StateGraph
    const schema = {
      // Define your schema properties here
      // For example:
      documents: {},
      metadata: {},
      // other properties...
    };
    
    const graph = new StateGraph({
      channels: schema, // Use the defined schema
      // other options...
    });
    
    // Node 1: Load existing Neo4j schema
    const loadSchemaNode = async (state: any) => {
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
          existingSchema: schema 
        };
      } catch (error) {
        console.error("Error loading Neo4j schema:", error);
        // Return a default schema if we can't query the actual schema
        return { 
          ...state,
          existingSchema: {
            labels: ["Document", "DocumentChunk", "Entity"],
            relationships: ["CONTAINS", "MENTIONS", "RELATED_TO"],
            properties: ["id", "text", "name", "type"]
          }
        };
      } finally {
        await session.close();
      }
    };
    
    // Node 2: Extract entities and relationships from chunks
    const extractFromChunksNode = async (state: any) => {
      console.log("Extracting entities and relationships from document chunks...");
      
      const { chunks, existingSchema } = state;
      
      // Skip if no chunks provided
      if (!chunks || chunks.length === 0) {
        return {
          ...state,
          extractedEntities: [],
          extractedRels: []
        };
      }
      
      // Combine chunks into a single text for context
      const context = chunks.join("\n\n").substring(0, 8000); // Limit context size
      
      // Prepare a prompt for entity and relationship extraction
      const knownLabels = existingSchema.labels || ["Document", "Entity", "Concept"];
      const knownRelationships = existingSchema.relationships || ["CONTAINS", "RELATED_TO"];
      
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
      
      Return the results in JSON format.`;
      
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
          extractedEntities: entities,
          extractedRels: relationships
        };
      } catch (error) {
        console.error("Error extracting entities:", error);
        return {
          ...state,
          extractedEntities: [],
          extractedRels: []
        };
      }
    };
    
    // Node 3: Check if entities already exist in Neo4j
    const checkEntitiesInNeo4jNode = async (state: any) => {
      console.log("Checking extracted entities against Neo4j database...");
      
      const { extractedEntities } = state;
      
      if (!extractedEntities || extractedEntities.length === 0) {
        return state;
      }
      
      const session = neo4jService.driver.session();
      let verifiedEntities = [...extractedEntities];
      
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
          extractedEntities: verifiedEntities
        };
      } catch (error) {
        console.error("Error checking entities in Neo4j:", error);
        return state; // Return unchanged state on error
      } finally {
        await session.close();
      }
    };
    
    // Node 4: Identify schema changes for user review
    const identifySchemaChangesNode = async (state: any) => {
      const { extractedEntities, extractedRels, existingSchema } = state;
      
      // Check for new entity types (labels) or relationship types
      const newEntityTypes = extractedEntities
        .map(e => e.label)
        .filter(label => !existingSchema.labels.includes(label));
        
      const newRelationshipTypes = extractedRels
        .map(r => r.type)
        .filter(type => !existingSchema.relationships.includes(type));
      
      return {
        ...state,
        pendingApprovals: [
          ...newEntityTypes.map(t => ({ type: 'entity_label', value: t })),
          ...newRelationshipTypes.map(t => ({ type: 'relationship_type', value: t }))
        ]
      };
    };
    
    // Add nodes to the graph
    // graphWorkflow.addNode("loadSchema", loadSchemaNode);
    // graphWorkflow.addNode("extractEntities", extractFromChunksNode);
    // graphWorkflow.addNode("checkEntities", checkEntitiesInNeo4jNode);
    // graphWorkflow.addNode("identifySchemaChanges", identifySchemaChangesNode);
    graph.addNode("loadSchema", loadSchemaNode);
    graph.addNode("extractEntities", extractFromChunksNode);
    graph.addNode("checkEntities", checkEntitiesInNeo4jNode);
    graph.addNode("identifySchemaChanges", identifySchemaChangesNode);
    

    // Connect with edges
    // graphWorkflow.addEdge("__start__", "loadSchema");
    // graphWorkflow.addEdge("loadSchema", "extractEntities");
    // graphWorkflow.addEdge("extractEntities", "checkEntities");
    // graphWorkflow.addEdge("checkEntities", "identifySchemaChanges");
    // graphWorkflow.addEdge("identifySchemaChanges", END);
    graph.addEdge("__start__", "loadSchema");
    graph.addEdge("loadSchema", "extractEntities");
    graph.addEdge("extractEntities", "checkEntities");
    graph.addEdge("checkEntities", "identifySchemaChanges");
    graph.addEdge("identifySchemaChanges", END);

    // Compile the graph
    // this.knowledgeGraphFlow = graphWorkflow.compile();
    this.knowledgeGraphFlow = graph.compile();
  }
  
  /**
   * Build knowledge graph from search results
   */
  async buildKnowledgeGraph(searchResults: any[]): Promise<any> {
    if (!searchResults || searchResults.length === 0) {
      console.warn("No search results provided for knowledge graph building");
      return { entities: [], relationships: [] };
    }
    
    try {
      // Extract text chunks from search results
      const textChunks = searchResults.map(result => result.text);
      
      // For now, due to TypeScript build issues, return mock data
      // In a production environment, you would uncomment this code:
      /*
      // Run the knowledge graph workflow
      const result = await this.knowledgeGraphFlow.invoke({
        chunks: textChunks,
        existingSchema: {},
        extractedEntities: [],
        extractedRels: [],
        pendingApprovals: []
      });
      
      return {
        entities: result.extractedEntities || [],
        relationships: result.extractedRels || [],
        newSchemaElements: result.pendingApprovals || []
      };
      */
      
      // Mock data for demonstration
      return {
        entities: [
          { name: "Knowledge Graph", label: "Concept", isNew: true },
          { name: "Neo4j", label: "Database", isNew: false },
          { name: "LangGraph", label: "Framework", isNew: true }
        ],
        relationships: [
          { source: "LangGraph", target: "Knowledge Graph", type: "BUILDS" },
          { source: "Neo4j", target: "Knowledge Graph", type: "STORES" }
        ],
        newSchemaElements: [
          { type: "entity_label", value: "Framework" },
          { type: "relationship_type", value: "BUILDS" }
        ]
      };
    } catch (error) {
      console.error("Error building knowledge graph:", error);
      return { entities: [], relationships: [] };
    }
  }
  /**
   * Process and store a document in all vector stores
   */
  async processDocument(filePath: string): Promise<{ documentId: string; s3Key: string }> {
    try {
      // Generate unique document ID
      const documentId = uuidv4();
      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName).toLowerCase();
      
      // Determine content type based on file extension
      let contentType = 'text/plain';
      if (fileExt === '.md' || fileExt === '.markdown') {
        contentType = 'text/markdown';
      } else if (fileExt === '.pdf') {
        contentType = 'application/pdf';
      }
      
      // Upload to S3
      const s3Key = await s3Service.uploadFile(filePath, contentType);
      
      // Read and parse the document
      let fileContent = '';
      
      // Handle different file types
      if (fileExt === '.pdf') {
        // For PDF files, we would normally use a PDF parsing library
        // For this implementation, we'll just read the file but in a real app
        // you would use a library like pdf-parse or pdf2json
        console.log('Processing PDF file:', fileName);
        // Mock extraction for demo purposes
        fileContent = `Extracted content from PDF: ${fileName}\n\n` +
                      `This is placeholder text since we're not actually parsing the PDF.\n` +
                      `In a production environment, you would use a PDF parsing library.`;
      } else {
        // For text-based files (markdown, txt)
        fileContent = fs.readFileSync(filePath, 'utf-8');
      }
      
      const chunks = this.chunkDocument(fileContent, fileName);
      
      // Store document metadata in PostgreSQL
      await postgresService.storeDocument(
        documentId,
        this.extractTitle(fileContent) || fileName,
        'upload',
        s3Key
      );
      
      // Store document chunks in both vector stores
      await Promise.all([
        neo4jService.storeDocumentChunks(documentId, chunks),
        postgresService.storeDocumentChunks(documentId, chunks)
      ]);
      
      return { documentId, s3Key };
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
  
  /**
   * Extract title from markdown content
   */
  private extractTitle(content: string): string | null {
    // Look for the first heading in the document
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }
  
  /**
   * Chunk document content for vector storage
   */
  private chunkDocument(
    content: string,
    fileName: string
  ): Array<{ text: string; metadata: Record<string, any> }> {
    // Parse markdown
    const htmlContent = md.render(content);
    
    // Extract the title
    const title = this.extractTitle(content) || fileName;
    
    // Simple chunking by markdown headers
    const sections = content.split(/^#{1,3}\s+/m).filter(Boolean);
    
    // Extract section titles using regex
    const sectionTitles = content.match(/^#{1,3}\s+(.+)$/gm) || [];
    
    return sections.map((section, index) => {
      // Get section title or use placeholder
      const sectionTitle = index < sectionTitles.length 
        ? sectionTitles[index].replace(/^#{1,3}\s+/, '')
        : `Section ${index + 1}`;
      
      return {
        text: section.trim(),
        metadata: {
          title,
          source: 'upload',
          fileName,
          sectionTitle,
          sectionIndex: index,
        }
      };
    });
  }
  
  /**
   * Perform similarity search across both vector stores
   * and combine results
   */
  async searchDocuments(query: string, limit: number = 5): Promise<any[]> {
    try {
      // Search in both vector stores
      const [neo4jResults, pgResults] = await Promise.all([
        neo4jService.similaritySearch(query, limit),
        postgresService.similaritySearch(query, limit)
      ]);
      
      // Combine and deduplicate results
      const combinedResults = [...neo4jResults, ...pgResults];
      const uniqueResults = this.deduplicateResults(combinedResults);
      
      // Sort by relevance score
      return uniqueResults.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
  
  /**
   * Deduplicate search results based on text content
   */
  private deduplicateResults(results: any[]): any[] {
    const seen = new Set();
    return results.filter(result => {
      const key = result.text;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Process Chapter 12 document and store in PGVector
   */
  async processChapter12(): Promise<{ documentId: string; chunkCount: number }> {
    try {
      return await pgVectorService.processChapter12();
    } catch (error) {
      console.error('Error processing Chapter 12:', error);
      throw error;
    }
  }

  /**
   * Query Chapter 12 based on a query string
   */
  async queryChapter12(query: string, limit: number = 5): Promise<Array<{ text: string; score: number; metadata: Record<string, any> }>> {
    try {
      const results = await pgVectorService.queryChapter12(query, limit);
      return this.deduplicateResults(results);
    } catch (error) {
      console.error('Error querying Chapter 12:', error);
      throw error;
    }
  }
}

export default new DocumentService();