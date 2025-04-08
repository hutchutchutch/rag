# Multi-Vector Store RAG System: Turbo Monorepo with pnpm, Docker, AWS ECS (Neo4j), and S3

This repository demonstrates a comprehensive **Retrieval-Augmented Generation (RAG)** system using multiple vector stores. It's built as a **Turborepo**-style monorepo, using **pnpm** for package management and **Docker** for both development and production builds. It integrates with **AWS ECS** for hosting Neo4j, **S3** for document storage, **PostgreSQL with pgvector** for vector-based searching, and **LangGraph** for multi-step logic in the **backend**. The **frontend** is built with Vite (React) and provides an intuitive user interface for document upload and chat interaction.

---

## Repository Overview

```
rag/
├── README.md                # Project documentation
├── package.json             # Root-level scripts and devDependencies
├── pnpm-workspace.yaml      # pnpm workspace definition
├── pnpm-lock.yaml           # Lock file for dependencies
├── turbo.json               # Turborepo config for pipeline tasks
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
├── postcss.config.js        # PostCSS configuration for styling
├── placeholders.md          # Documentation of placeholders for deployment
│
├── apps/                    # Application code for both frontend and backend
│   ├── frontend/            # React/Vite-based frontend
│   │   ├── Dockerfile.dev   # Development Dockerfile with hot reload
│   │   ├── docker-compose.yml # Frontend-specific Docker Compose
│   │   ├── package.json     # Frontend dependencies
│   │   ├── index.html       # HTML entry point
│   │   ├── tailwind.config.js # Tailwind CSS configuration
│   │   ├── postcss.config.js # PostCSS configuration
│   │   └── src/
│   │       ├── main.tsx     # Application entry point
│   │       ├── App.tsx      # Main application component
│   │       ├── index.css    # Global styles
│   │       ├── components/  # UI components
│   │       │   ├── ChatFeed.tsx       # Chat message display and input
│   │       │   ├── GraphPanel.tsx     # Visualization of vector relationships
│   │       │   ├── Sidebar.tsx        # Collapsible sidebar with dropdowns
│   │       │   ├── VectorStorePanel.tsx # Vector store status and info
│   │       │   └── ui/               # Reusable UI components
│   │       │       ├── button.tsx    # Button component
│   │       │       ├── card.tsx      # Card component
│   │       │       ├── collapsible.tsx # Collapsible panel component
│   │       │       ├── form.tsx      # Form components
│   │       │       ├── input.tsx     # Input field component
│   │       │       ├── progress.tsx  # Progress indicator
│   │       │       └── select.tsx    # Dropdown select component
│   │       ├── contexts/
│   │       │   └── book-context.tsx  # Context for document management
│   │       ├── hooks/
│   │       │   ├── use-rag-pipeline.ts # Hook for RAG operations
│   │       │   └── use-toast.ts      # Toast notification hook
│   │       ├── lib/
│   │       │   ├── rag.ts            # RAG API functions and types
│   │       │   └── utils.ts          # Utility functions
│   │       └── shared/
│   │           └── schema.ts         # Shared type definitions
│   │
│   └── backend/             # Express.js + LangGraph backend
│       ├── Dockerfile.dev   # Development Dockerfile
│       ├── docker-compose.yml # Backend-specific Docker Compose
│       ├── package.json     # Backend dependencies
│       ├── .env.example     # Example environment variables
│       ├── uploads/         # Directory for uploaded documents
│       │   └── ansi.md      # Sample document for testing
│       └── src/
│           ├── index.ts     # Server entry point
│           ├── config/      # Configuration
│           │   └── index.ts # Configuration variables and setup
│           ├── controllers/ # API route handlers
│           │   ├── document.controller.ts # Document upload/processing
│           │   └── chat.controller.ts     # Chat functionality
│           ├── middlewares/ # Express middlewares
│           │   └── upload.middleware.ts   # File upload handling
│           ├── models/      # Data models (if any)
│           ├── routes/      # API route definitions
│           │   ├── document.routes.ts     # Document API routes
│           │   └── chat.routes.ts         # Chat API routes
│           ├── services/    # Business logic services
│           │   ├── s3.service.ts          # AWS S3 integration
│           │   ├── neo4j.service.ts       # Neo4j vector store service
│           │   ├── postgres.service.ts    # PostgreSQL vector store
│           │   ├── document.service.ts    # Document processing
│           │   └── chat.service.ts        # Chat with LangGraph
│           └── utils/       # Utility functions
│
├── infra/                  # Infrastructure configuration
│   ├── docker-compose.yml   # Main Docker Compose for all services
│   ├── docker-compose-dev.yml # Development Docker Compose
│   ├── neo4j/              # Neo4j configuration
│   │   ├── import/         # Import directory for Neo4j
│   │   └── plugins/        # Plugins for Neo4j
│   └── aws/                # AWS infrastructure
│       ├── ecs-neo4j-config/ # ECS configuration for Neo4j
│       │   ├── neo4j-fargate-service.md # Documentation
│       │   └── task-definition.json    # ECS task definition
│       ├── s3-setup.md     # Documentation for S3 setup
│       └── google-drive-docs/ # Google Drive integration
│           └── google-drive-integration.md # Documentation
│
├── packages/               # Shared libraries (if any)
│
└── scripts/                # Helper scripts
    ├── google-drive-import.ts # Script for importing from Google Drive
    └── seed-neo4j.ts       # Script for initializing Neo4j
```

This repository structure provides a complete organization for a multi-vector store RAG system using the Turborepo monorepo pattern. Here's a breakdown of the key areas:

### Key Directories

1. **`apps/frontend/`**  
   - **React/Vite** UI with TypeScript and Tailwind CSS
   - **Core Components**:
     - `ChatFeed.tsx`: Real-time chat interface with message history and input controls
     - `Sidebar.tsx`: Collapsible sidebar with dropdown menus for document management
     - `GraphPanel.tsx`: Visualization of vector embeddings and relationships
     - `VectorStorePanel.tsx`: Displays vector store status and metrics
   - **UI Component Library**: Reusable UI components in `ui/` folder:
     - Buttons, cards, inputs, progress indicators, and more
   - **Hooks and Utilities**:
     - `use-rag-pipeline.ts`: Core hook managing document processing and chat functionality
     - `use-toast.ts`: Notification management
     - `rag.ts`: API client functions for backend communication
   - **State Management**:
     - Context providers for document and application state
     - Type definitions shared with backend

2. **`apps/backend/`**  
   - **Express.js** server with TypeScript
   - **API Structure**:
     - RESTful API with dedicated routes and controllers
     - Middleware for file uploads and request processing
   - **Core Services**:
     - `s3.service.ts`: Integration with AWS S3 for document storage
     - `neo4j.service.ts`: Primary vector store using Neo4j graph database
     - `postgres.service.ts`: Secondary vector store with PostgreSQL/pgvector
     - `document.service.ts`: Document processing pipeline
     - `chat.service.ts`: LangGraph implementation for RAG conversations
   - **Environment Configuration**:
     - `.env.example`: Template for environment variables
     - `config/index.ts`: Application configuration management
   - **Document Storage**:
     - `uploads/`: Directory for temporarily storing uploaded documents
     - Sample document (`ansi.md`) for testing

3. **`infra/`**  
   - **Docker Compose Files**:
     - `docker-compose.yml`: Main configuration for all services
     - `docker-compose-dev.yml`: Development-specific configuration
   - **AWS Infrastructure**:
     - `ecs-neo4j-config/`: Configuration for Neo4j on AWS ECS
     - `s3-setup.md`: Documentation for S3 bucket setup
   - **Neo4j Configuration**:
     - Directory structure for plugins and imports
   - **Google Drive Integration**:
     - Documentation and configuration for Drive API integration

4. **Root Configuration**:
   - `pnpm-workspace.yaml`: Monorepo workspace definition
   - `turbo.json`: Turborepo pipeline configuration
   - `tsconfig.json`: TypeScript configuration
   - `eslint.config.js`: Code linting rules
   - `postcss.config.js`: CSS processing configuration
   - `placeholders.md`: Documentation of configuration placeholders for deployment

5. **`scripts/`**  
   - Utility scripts for maintenance and initialization:
     - `seed-neo4j.ts`: Initializes Neo4j with schema constraints
     - `google-drive-import.ts`: Testing script for Google Drive integration

6. **`packages/`** (optional)  
   - Reserved for shared libraries that might be extracted later

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

## Frontend Pages and Components

The frontend application provides an intuitive interface for interacting with the RAG system. It follows a three-panel layout with a primary chat interface and supporting sidebars.

### Main Application Layout

- **Three-Panel Design**: Consists of left sidebar, central content area, and optional right sidebar
- **Collapsible Sidebars**: Sidebars can be collapsed to maximize working space
- **Dark Theme**: Modern dark theme optimized for readability and reduced eye strain

### Left Sidebar Components

1. **Document Management**
   - **Upload Section**: Expandable dropdown for uploading markdown files
   - **Document Browser**: List of all uploaded documents with metadata
   - **Vector Store Status**: Shows connection status and vector counts for Neo4j and PostgreSQL
   - **Search Interface**: Allows direct querying of vector stores without using chat

2. **Sidebar Navigation**
   - **Collapsible Sections**: All sections collapse/expand with smooth animations
   - **Adaptive Width**: Items take full sidebar width for easy visibility and access
   - **Status Indicators**: Shows connection status for different backend services

### Central Chat Interface

1. **Chat Feed**
   - **Message History**: Displays alternating user and AI messages in conversation format
   - **Message Styling**: Different styling for user vs. AI messages
   - **Automatic Scrolling**: Auto-scrolls to the latest message
   - **Empty State**: Helpful prompt when no conversation has started

2. **Input Controls**
   - **Text Input**: Full-width input field for entering questions
   - **Send Button**: Submits questions with loading state indicator
   - **Clear Conversation**: Option to reset the current chat session

### Right Sidebar Components (Optional)

1. **Vector Visualization**
   - **Graph View**: Visual representation of document chunks and relationships
   - **Similarity Scores**: Shows relevance between query and retrieved chunks
   - **Source Attribution**: Links retrieved information back to original documents

2. **Technical Details**
   - **Embedding Information**: Technical details about vector embeddings
   - **Performance Metrics**: Response times and retrieval statistics
   - **Debug Information**: For developers to understand the RAG pipeline

### Additional Frontend Features

1. **Real-time Feedback**
   - **Processing Indicators**: Visual progress of document upload and processing
   - **Step Tracking**: Shows current step in the RAG pipeline (upload, chunking, embedding, etc.)
   - **Loading States**: Clear indicators during searches and chat operations

2. **Responsive Adaption**
   - **Mobile-friendly Design**: Adapts layout for smaller screens
   - **Collapsible Elements**: Maximize working space on any device
   - **Touch-friendly Controls**: Optimized for both mouse and touch interactions

3. **Error Handling**
   - **Graceful Error Messages**: User-friendly error notifications
   - **Retry Mechanisms**: Options to retry failed operations
   - **Connection Recovery**: Automatic reconnection to backend services

4. **User Experience Enhancements**
   - **Keyboard Shortcuts**: For common operations like sending messages
   - **Context Highlighting**: Highlights which parts of documents were used for answers
   - **Hover Previews**: Quick previews of document chunks on hover

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