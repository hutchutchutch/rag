# Multi-Vector Store RAG System: Turbo Monorepo with pnpm, Docker, AWS ECS (Neo4j), and S3

This repository demonstrates a comprehensive **Retrieval-Augmented Generation (RAG)** system using multiple vector stores. It's built as a **Turborepo**-style monorepo, using **pnpm** for package management and **Docker** for both development and production builds. It integrates with **AWS ECS** for hosting Neo4j, **S3** for document storage, **PostgreSQL with pgvector** for vector-based searching, and **LangGraph** for multi-step logic in the **backend**. The **frontend** is built with Vite (React) and provides an intuitive user interface for document upload and chat interaction.

---

## Repository Overview

```
my-app/
├── apps/
│   ├── frontend/           # Vite-based frontend
│   │   ├── Dockerfile      # Production Dockerfile
│   │   ├── Dockerfile.dev  # Dev Dockerfile (hot reload)
│   │   ├── src/
│   │   │   ├── pages/      # Upload page, chat interface, vector store visualization
│   │   │   ├── components/ # Shared UI components (sidebar, chat window, document viewer)
│   │   │   ├── hooks/      # React hooks
│   │   │   └── ...
│   │   └── ...
│   └── backend/            # Express.js + LangGraph
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       ├── src/
│       │   ├── routes/     # API routes for documents, embeddings, chat
│       │   ├── controllers/ # Handlers for document processing, embedding generation
│       │   ├── services/   # Business logic, e.g. vector storage, retrieval
│       │   ├── langgraph/  # Agents using LangGraph for RAG workflow (retrieval, summarization)
│       │   └── ...
│       └── ...
├── infra/                  # Infrastructure for Neo4j, Docker Compose, AWS config
│   ├── docker-compose.yml  # Orchestrates local dev environment
│   ├── aws/
│   │   ├── ecs-neo4j-config/ # ECS Task Definitions or scripts for hosting Neo4j
│   │   ├── s3-setup.md     # Steps/scripts for S3 config
│   │   ├── google-drive-docs/ # Scripts for Google Drive integration
│   │   └── ...
│   └── ...
├── packages/               # Shared libraries across apps (optional)
│   ├── shared-lib/         # e.g. reusable domain models, utils
│   └── ...
├── scripts/                # Helper scripts/CLI automation
│   ├── seed-neo4j.ts       # Initialize database with schema constraints
│   ├── google-drive-import.ts # Script for testing drive import
│   └── ...
├── turbo.json              # Turborepo config for pipeline tasks
├── pnpm-workspace.yaml     # pnpm workspace definition
├── package.json            # Root-level scripts and devDependencies
└── README.md               # This file
```

### Key Directories

1. **`apps/frontend/`**  
   - **Vite** for the UI with React and TypeScript.
   - **Dockerfiles**:
     - `Dockerfile.dev` for local dev with hot reload.
     - `Dockerfile` for production builds.
   - Pages include:
     - **Document Upload**: Interface for uploading markdown documents or importing from Google Drive.
     - **Chat Interface**: Allows users to ask questions about uploaded documents.
     - **Vector Store Visualization**: View document chunks and their vector representations.
   - Services layer for API communication with the backend.
   - Type definitions that mirror backend data models.

2. **`apps/backend/`**  
   - **Express.js** with TypeScript.  
   - **Neo4j Integration**:
     - Connection management with the Neo4j database.
     - Models for documents, chunks, embeddings, and relationships.
     - Complex graph queries for document retrieval.
   - **PostgreSQL/pgvector Integration**:
     - Secondary vector storage for comparison and backup.
     - Vector similarity search capabilities.
   - **RESTful API**:
     - Endpoints for document uploading and processing.
     - Embedding generation and storage.
     - Chat conversation handling.
   - Integrates **LangGraph** for multi-step workflows, e.g. document chunking, embedding generation, retrieval, and answer generation.  
   - Connects to:
     - **AWS S3** for document storage (markdown files).
     - **Neo4j** on ECS for storing document relationships and vector embeddings.
     - **PostgreSQL with pgvector** for additional vector storage and search.
     - **Google Gemini** for creating embeddings and text generation.

3. **`infra/`**  
   - **docker-compose.yml**: For local dev, spins up Neo4j, PostgreSQL, LocalStack (S3 emulation), the backend, and the frontend.  
   - **`aws/ecs-neo4j-config/`**: Defines how we run Neo4j in AWS ECS (Fargate or EC2-based tasks).  
   - **`aws/s3-setup.md`**: Docs for creating S3 buckets for storing documents.  
   - **`aws/google-drive-docs/`**: Scripts and documentation for Google Drive integration.

4. **`packages/`** (optional)  
   - If you have shared code (utilities, embedding algorithms, or retrieval strategies), place them in subfolders.  
   - **pnpm** automatically handles linking across your workspace.

5. **`scripts/`**  
   - **`seed-neo4j.ts`**: Seeds the database with schema constraints and initial data.  
   - **`google-drive-import.ts`**: Script for testing Google Drive integration.

---

## Intent & Features

1. **Docker-based Development**  
   - Each app has a dev Dockerfile for immediate reloading.  
   - `infra/docker-compose.yml` can run the entire stack: Neo4j, PostgreSQL, the backend, and the frontend.

2. **AWS ECS for Neo4j**  
   - We use AWS ECS to run a **self-hosted Neo4j** container. This is essential for storing document relationships and vector embeddings.  
   - The `ecs-neo4j-config/` folder helps define or store the ECS task definition.

3. **S3 for Document Storage**  
   - Markdown documents are stored in **S3**.  
   - The backend manages these uploads, storing metadata in Neo4j or PostgreSQL.

4. **Dual Vector Storage**  
   - Primary storage in **Neo4j** for graph-based relationships and retrieval.
   - Secondary storage in **PostgreSQL with pgvector** for comparison and backup.
   - Uses **Google Gemini** to create embeddings for vector representation.

5. **Google Drive Integration**  
   - Allow users to import documents from their Drive.
   - Integration details in `infra/aws/google-drive-docs/`.

6. **LangGraph** (Backend)  
   - The backend orchestrates the RAG workflow (chunking, embedding, retrieval, generation) with **LangGraph**.  
   - Code in `apps/backend/src/langgraph/`, with typical files (`graph.ts`, `prompts.ts`, etc.).

---

## Development Workflow

1. **pnpm Install**  
   ```bash
   pnpm install
   ```
   Installs dependencies across the entire monorepo.

2. **Local Docker**  
   In `infra/`, run:
   ```bash
   docker compose up --build
   ```
   This spins up Neo4j, PostgreSQL, LocalStack (S3 emulation), backend (Express + LangGraph), frontend (Vite).

   Alternatively, run them separately:
   ```bash
   pnpm --filter=backend dev
   pnpm --filter=frontend dev
   ```

3. **AWS ECS Deployment**  
   The folder `infra/aws/ecs-neo4j-config/` or any Terraform/Copilot scripts define how to host Neo4j in ECS.

   The backend and frontend each have Dockerfiles you can build/push to ECR, then define ECS services.

   S3, PostgreSQL, and other resources can be configured via AWS console or IaC in the same folder.

4. **Credentials & Env Variables**  
   Manage environment variables (S3 buckets, Google OAuth secrets, Gemini API keys) through `.env` in dev and ECS secrets in production.

5. **Google Drive to S3 Flow**
   - User authenticates with Google
   - Backend retrieves a list of drive files
   - User selects files to upload
   - Backend pulls selected files, chunks them, and stores in S3
   - LangGraph nodes handle chunking + embedding, storing vectors in Neo4j and PostgreSQL

---

## RAG System Features

1. **Document Processing**:
   - Upload markdown documents directly or import from Google Drive.
   - Automatic chunking of documents for efficient processing.
   - Storage in S3 with metadata in Neo4j.

2. **Dual Vector Storage**:
   - Store embeddings in both Neo4j graph database and PostgreSQL with pgvector extension.
   - Compare retrieval results from both sources for improved accuracy.

3. **Gemini Embeddings**:
   - Generate high-quality embeddings using Google's Gemini model.
   - Store and retrieve embeddings from dual vector stores.

4. **Chat Interface**:
   - Ask questions about uploaded documents.
   - System retrieves relevant context from vector stores.
   - LangGraph orchestrates the retrieval and answer generation process.

5. **Vector Store Visualization**:
   - View document chunks and their vector representations.
   - Visualize similarity between chunks for better understanding.

---

## Production Considerations

1. **Dockerfiles**
   - Each app's Dockerfile (production) is likely multi-stage, building minimal images for ECS.

2. **ECS**
   - Push images to ECR, define tasks for backend, frontend, plus the Neo4j container.
   - Store document data in S3, connect to PostgreSQL for secondary vector storage.

3. **Security**
   - Keep secrets in AWS Secrets Manager or ECS Task Definition secrets.
   - Use IAM roles to allow the backend container to read/write S3, query databases, etc.

---

## Technology Stack

This RAG system uses:

- **Frontend**: 
  - React with TypeScript for type-safe components
  - Vite for fast development and optimized builds
  - React Router for navigation between features
  - Axios for API communication with the backend

- **Backend**:
  - Express.js with TypeScript for a robust API server
  - Neo4j database for graph-based data relationships
  - PostgreSQL with pgvector for secondary vector storage
  - RESTful API design with structured controllers and models
  - Google Gemini for embeddings and text generation

- **Infrastructure**:
  - Turborepo + pnpm for consolidated multi-app dev
  - Docker for local dev/prod builds
  - Neo4j on AWS ECS to store document relationships and embeddings
  - S3 for storing document files
  - PostgreSQL with pgvector for comparison vector storage
  - LangGraph in the backend to orchestrate the RAG workflow

## Getting Started

### Prerequisites

- Node.js v18+ and pnpm
- Docker and Docker Compose
- Google Gemini API key

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment variables**

   Create a `.env` file in the backend directory based on the `.env.example`:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Add your Google Gemini API key to the `.env` file.

4. **Start the development environment**

   ```bash
   cd infra
   docker compose up
   ```

   This will start:
   - Neo4j database
   - PostgreSQL with pgvector
   - LocalStack for S3 emulation
   - Backend Express server
   - Frontend Vite server

5. **Access the application**

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Neo4j Browser: http://localhost:7474

## Conclusion

This RAG system provides a comprehensive solution for document processing and question answering. By leveraging dual vector stores, it combines the strengths of graph databases and traditional vector search for improved retrieval capabilities. The LangGraph-orchestrated workflow ensures a smooth pipeline from document upload to answer generation.

By following this architecture, you can easily build robust RAG applications that scale seamlessly in AWS. It's flexible for both local development and production-ready container deployments. Enjoy building your Multi-Vector Store RAG System!