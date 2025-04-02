# RAG Application with Knowledge Graph

This monorepo contains a RAG (Retrieval-Augmented Generation) application with vector store management and knowledge graph visualization.

## Project Structure

- `apps/frontend`: React + Vite application for the UI
- `apps/backend`: Express.js server for RAG logic
- `packages/`: Shared libraries and configurations
- `infra/`: Infrastructure configuration (Docker, AWS)
- `scripts/`: Helper scripts and tools

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

## Development

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Features

- Document upload and vector store management
- Interactive chat interface with RAG capabilities
- Knowledge graph visualization
- Neo4j integration for graph storage