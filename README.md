# Multi-Vector Store RAG System

This repository demonstrates a comprehensive **Retrieval-Augmented Generation (RAG)** system using multiple vector stores. It's built as a **Turborepo**-style monorepo with **pnpm** for package management and **Docker** for containerization. 

The system stores document embeddings in both **Neo4j** and **PostgreSQL with pgvector**, uploads files to **AWS S3**, and uses **Google Gemini** for creating embeddings. The RAG pipeline is orchestrated using **LangGraph** in the Express.js backend, with a **React/Vite** frontend for interacting with the system.

## RAG System Features

1. **Dual Vector Storage** - Stores embeddings in both Neo4j graph database and PostgreSQL with pgvector extension
2. **S3 Document Storage** - Uploads and retrieves markdown documents from S3
3. **Gemini Embeddings** - Uses Google's Gemini embedding model for vector representation
4. **LangGraph Pipeline** - Orchestrates the retrieval-augmented generation process
5. **React Frontend** - Provides an intuitive user interface for document upload and chat

---

## Repository Overview

```
my-app/
├── apps/
│   ├── frontend/              # Vite-based frontend
│   │   ├── Dockerfile         # Production Dockerfile
│   │   ├── Dockerfile.dev     # Dev Dockerfile (hot reload)
│   │   └── ...
│   └── backend/               # Express.js backend w/ LangGraph
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       └── ...
├── infra/                     # Infrastructure resources
│   ├── docker-compose.yml     # For local dev environment
│   ├── aws/
│   │   ├── ecs-neo4j-config/  # Configuration for ECS tasks running Neo4j
│   │   ├── s3-setup.md        # Steps or scripts for S3 bucket creation
│   │   ├── google-drive-docs/ # Scripts or docs for Google Drive integration
│   │   └── ...
│   └── ...
├── packages/                  # Shared libraries across apps (optional)
│   ├── shared-lib/            # e.g. reusable domain models, utils
│   └── ...
├── scripts/                   # Helper scripts / CLI automation
│   ├── seed-neo4j.ts
│   ├── google-drive-import.ts # Possibly script for testing drive import
│   └── ...
├── turbo.json                 # Turborepo config for pipeline tasks
├── pnpm-workspace.yaml        # pnpm workspace definition
├── package.json               # Root-level scripts & devDependencies
└── README.md                  # This file
```

### Key Directories

1. **`apps/frontend/`**  
   - Uses **Vite** for the UI, Dockerfiles for dev & prod.  
   - Connects to the backend's API for data, including drive import and file management.

2. **`apps/backend/`**  
   - **Express.js** with TypeScript.  
   - **LangGraph** integration for multi-step agent flows (e.g., retrieval, summarization, etc.).  
   - Connects to AWS S3 (object storage) for uploaded docs, Google Drive for fetching user files, and Amazon OpenSearch + Neo4j for vector search and graph-based queries.

3. **`infra/`**  
   - Contains **docker-compose.yml** for local dev, spinning up backend, frontend, and a local test environment for Neo4j if desired.  
   - **`aws/`** subdirectory holds resources for deploying **Neo4j** on ECS, S3 config, Google Drive integration notes, etc.  
   - AWS ECS configuration for **Neo4j** helps you run self-managed instances or cluster on ECS Fargate/EC2.  
   - S3 scripts for bucket creation, policy setup, etc.

4. **`packages/`** (optional)  
   - If you have shared code or libs used by multiple apps, store them here.  
   - If you're purely referencing everything from the root, `pnpm` handles synergy, but many prefer a `packages/` folder to keep shared items clear.

5. **`scripts/`**  
   - Helper or CLI tasks like `seed-neo4j.ts` to push initial data or graph constraints, `google-drive-import.ts` for testing Google integration, or one-off scripts for admin tasks.

---

## Intent & Features

1. **Docker-based Development**  
   - Each app (frontend, backend) has a `Dockerfile.dev` for hot reload in local dev, plus a production `Dockerfile`.  
   - The `infra/docker-compose.yml` can orchestrate local dev with a single command: `docker compose up --build`.

2. **AWS ECS for Neo4j**  
   - Instead of hosting Neo4j locally in production, we define ECS tasks that run the official Neo4j image or a customized build (with plugins, e.g. APOC).  
   - The ECS config (like a `task-definition.json` or Terraform script) is stored in `infra/aws/ecs-neo4j-config`. This includes networking details, storage volumes, cluster setup, etc.

3. **AWS S3 Object Storage**  
   - The **backend** uses S3 for storing user-uploaded documents. The config (credentials, region, bucket name) can be placed in environment variables or in a config file under `apps/backend`.  
   - `infra/aws/s3-setup.md` might outline how to create the S3 bucket, attach IAM policies, etc.

4. **Google Drive Integration**  
   - The backend can connect to users' Google accounts, retrieving drive files they want to process. The user's documents can then be stored or backed up to S3.  
   - Scripts or docs for this are in `infra/aws/google-drive-docs` or a `scripts/google-drive-import.ts`.

5. **Vector Search**  
   - We are using **Gemini embeddings** for our vector transformations.  
   - The backend can connect to **Amazon OpenSearch** for vector search capabilities or **Neo4j** if we store vectors in the graph. This allows multiple retrieval patterns:
     - **Graph-based** queries in Neo4j
     - **Vector-based** queries in OpenSearch or Neo4j's native vector indexing
     - Combine both as needed

6. **LangGraph in the Backend**  
   - `apps/backend` will have the typical structure for **LangGraph**:
     - `configuration.ts`, `graph.ts`, `prompts.ts`, `state.ts`, `utils.ts` or similar  
   - This orchestrates reading from S3, calling Google Drive APIs, embedding text with Gemini, and searching in OpenSearch/Neo4j.

---

## Development Workflow

1. **pnpm Install**  
   ```bash
   pnpm install
   ```
   Installs all dependencies across the monorepo, linking shared libraries if any exist in packages/.

2. **Local Docker**

   From infra/, run:
   ```bash
   docker compose up --build
   ```
   This can spin up Neo4j, backend (Express + LangGraph), and frontend (Vite).

   Alternatively, each app can be run individually, e.g.:
   ```bash
   pnpm --filter=backend dev
   pnpm --filter=frontend dev
   ```
   Make sure you have a local or Docker-based instance of Neo4j if the backend depends on it.

3. **AWS ECS Deployment**

   `infra/aws/ecs-neo4j-config/` or a Terraform module might define how to deploy Neo4j on ECS.

   The backend and frontend can each be built/pushed to ECR and run as ECS services.

   S3 and any other services (like Amazon OpenSearch) also get configured here or in your separate IaC repo.

4. **Credentials & Environment Variables**

   Store AWS credentials, S3 bucket name, Google OAuth client secrets, and Neo4j connection info in a .env or pass them in from CI secrets / ECS Task Definitions.

   For dev, you might have a .env in apps/backend or pass them to Docker Compose. For production, use ECS secrets or Parameter Store.

5. **Google Drive to S3 Flow**
   - User authenticates with Google
   - Backend retrieves a list of drive files
   - User selects files to upload
   - Backend pulls selected files, optionally chunking or analyzing them, then stores them in S3
   - Optionally, LangGraph nodes handle chunking + embedding, storing vectors in OpenSearch or Neo4j

6. **How Vector Search & Gemini Embeddings Fit In**
   - Gemini provides embeddings for user documents or queries.
   - The backend calls an API to transform text to vector form.
   - OpenSearch or Neo4j can store these vectors. The backend's retrieval logic might do:
     - Convert user query to vector
     - Compare with document vectors in OpenSearch or in Neo4j's vector store
     - Combine results with graph-based relationships or re-rank them for the user

---

## Production Considerations

1. **Dockerfiles**
   - Each app has a dev (Dockerfile.dev) and a production (Dockerfile).
   - Production often uses multi-stage builds for minimal images.

2. **ECS**
   - We push each Docker image (frontend, backend, possibly a custom Neo4j) to ECR, then define ECS tasks/services.
   - `infra/aws/ecs-neo4j-config/` manages persistent volumes or EFS for Neo4j data.

3. **Security**
   - Storing secrets in ECS Task Definitions or AWS Secrets Manager, not in .env committed to the repo.
   - Proper IAM roles for S3, OpenSearch, etc.

---

## Getting Started with the RAG System

### Prerequisites

- Node.js v18+ and pnpm
- Docker and Docker Compose
- Google Gemini API key
- OpenAI API key

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rag
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

   Add your Google Gemini API key and OpenAI API key to the `.env` file.

4. **Start the development environment**

   ```bash
   docker-compose -f infra/docker-compose-dev.yml up
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

### Using the RAG System

1. **Upload Documents**
   - Use the sidebar to upload the `ansi.md` file
   - The system will process it through the RAG pipeline

2. **Chat Interface**
   - Ask questions about the uploaded document
   - The system retrieves relevant context and generates answers

3. **Vector Store Visualization**
   - View document chunks and their vector representations

## Conclusion

This RAG system demonstrates a practical implementation of:

- Multi-vector store architecture with Neo4j and PostgreSQL/pgvector
- LangGraph for orchestrating the RAG workflow
- S3 integration for document storage
- Gemini embeddings for vector creation
- React/Vite frontend for user interaction

By following this implementation, you can build sophisticated RAG systems that combine the strengths of graph databases and vector search for improved retrieval capabilities.