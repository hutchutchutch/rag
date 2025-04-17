# Agentic Flow Architecture

This document explains the updated architecture which now uses two separate agentic LangGraph flows:

## 1. Chat RAG Agentic Flow

This flow handles user queries by determining the appropriate retrieval strategy, fetching context, and generating responses.

### Flow Architecture

1. **Determine Search Type** - Analyzes the user question to decide between vector search, graph search, or hybrid approach
2. **Retrieve Documents** - Performs initial document retrieval using PostgreSQL vector search
3. **Generate Subqueries** - For complex questions, breaks them down into simpler subqueries
4. **Vector Search** - Executes enhanced retrieval using subqueries
5. **Generate Cypher Query** - Creates a Neo4j Cypher query for graph-based retrieval
6. **Execute Cypher Query** - Runs the Cypher query against Neo4j database
7. **Generate Response** - Creates a final response based on all retrieved context and chat history

### State Management

The ChatRagState tracks:
- User question
- Chat history
- Retrieved documents
- Context from both vector and graph searches
- Search type (vector, graph, hybrid)
- Generated subqueries and Cypher queries
- Final response

## 2. Knowledge Graph Builder Flow

This flow extracts entities and relationships from document chunks to build a knowledge graph, with user review.

### Flow Architecture

1. **Load Schema** - Queries Neo4j to get existing entity types and relationship types
2. **Extract Entities** - Analyzes document chunks to identify entities and relationships
3. **Check Entities** - Verifies if entities already exist in Neo4j or are new
4. **Identify Schema Changes** - Identifies new entity/relationship types requiring user review
5. **Prepare For User Review** - Formats the results for frontend display and user editing

### State Management

The KnowledgeGraphState tracks:
- Document chunks
- Existing Neo4j schema
- Extracted entities and relationships
- Pending schema approvals
- User approval status
- Extraction ID for tracking

## User Involvement

The key architectural improvement is making user review explicit in the knowledge graph flow:

1. The flow stops after entity extraction and schema change identification
2. Results are displayed in the frontend for user review
3. Users can add, edit, or remove entities and relationships
4. Only after user approval are changes saved to Neo4j

## Integration

The two flows work together through:

1. The chat RAG flow providing search results for knowledge graph extraction
2. The knowledge graph builder creating graph data that the chat flow can later query
3. User approval acting as a quality control gateway between extraction and persistence

This modular architecture cleanly separates concerns while allowing the flows to enhance each other's capabilities.