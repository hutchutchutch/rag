# RAGGuide API Documentation

This document outlines the REST API endpoints for the RAGGuide vector store and knowledge graph system.

## API Endpoints

| Verb | Path | Purpose |
|------|------|---------|
| **GET** | `/api/health` | Check API health |
| **GET** | `/health` | Check system health |
| **POST** | `/api/documents/upload` | Upload & process a document |
| **GET** | `/api/documents/search` | Search document chunks and optionally build a knowledge graph |
| **POST** | `/api/documents/knowledge-graph/:extractionId` | Submit a knowledge graph to Neo4j |
| **POST** | `/api/chat` | Send a message to chat with document content |

## Detailed Endpoint Documentation

### Health Checks

**GET `/api/health` or `/health`**

Check the health status of the API.

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2025-04-28T12:00:00.000Z"
}
```

### Document Management

**POST `/api/documents/upload`**

Upload and process a document file for vector storage.

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `file`: Document file (.md, .pdf)

**Response:**
```json
{
  "success": true,
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "s3Key": "550e8400-e29b-41d4-a716-446655440000-document.md",
  "downloadUrl": "https://s3-bucket.region.amazonaws.com/...",
  "message": "Document processed successfully"
}
```

**GET `/api/documents/search`**

Search for relevant document chunks based on a query.

**Parameters:**
- `query` (required): Search query text
- `limit` (optional): Maximum number of results (default: 5)
- `buildKnowledgeGraph` (optional): Generate a knowledge graph from results (default: false)

**Response:**
```json
{
  "success": true,
  "query": "vector database",
  "results": [
    {
      "id": "abc123",
      "text": "Vector databases store embeddings that capture the semantic meaning of text...",
      "score": 0.89,
      "metadata": {
        "source": "upload",
        "title": "Introduction to Vector Databases"
      }
    }
  ],
  "knowledgeGraph": {
    "entities": [
      { "name": "Vector Database", "label": "Technology", "isNew": true },
      { "name": "Embeddings", "label": "Concept", "isNew": false }
    ],
    "relationships": [
      { "source": "Vector Database", "target": "Embeddings", "type": "STORES" }
    ],
    "newSchemaElements": [
      { "type": "entity_label", "value": "Technology" }
    ],
    "extractionId": "kg-1234567890-abcdef"
  },
  "resultCount": 1
}
```

**POST `/api/documents/knowledge-graph/:extractionId`**

Submit a knowledge graph for storage in Neo4j.

**Path Parameters:**
- `extractionId`: Unique ID for the extraction session

**Request:**
```json
{
  "entities": [
    { "name": "Vector Database", "label": "Technology" },
    { "name": "Embeddings", "label": "Concept" }
  ],
  "relationships": [
    { "source": "Vector Database", "target": "Embeddings", "type": "STORES" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Knowledge graph saved successfully",
  "extractionId": "kg-1234567890-abcdef",
  "entitiesAdded": 2,
  "relationshipsAdded": 1
}
```

### Chat Interface

**POST `/api/chat`**

Send a message to chat with the RAG system.

**Request:**
```json
{
  "message": "What is a vector database?",
  "history": [
    { "type": "human", "content": "How does RAG work?" },
    { "type": "ai", "content": "RAG works by retrieving relevant information..." }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "A vector database is a specialized database designed to store...",
  "history": [
    { "type": "human", "content": "How does RAG work?" },
    { "type": "ai", "content": "RAG works by retrieving relevant information..." },
    { "type": "human", "content": "What is a vector database?" },
    { "type": "ai", "content": "A vector database is a specialized database designed to store..." }
  ]
}
```

## Testing with Postman

Import **ragguide.postman_collection.json** into Postman, set the base_url environment variable to your server address (e.g., `http://localhost:3000`), and start testing the API endpoints.

> Run automated tests with:  
> `newman run docs/postman/ragguide.postman_collection.json -e docs/postman/local.postman_environment.json`
