# Multi-Vector Store RAG System: Turbo Monorepo with pnpm, Docker, AWS ECS (Neo4j), and S3

This repository demonstrates a comprehensive **Retrieval-Augmented Generation (RAG)** system using multiple vector stores. It's built as a **Turborepo**-style monorepo, using **pnpm** for package management and **Docker** for both development and production builds. It integrates with **AWS ECS** for hosting Neo4j, **S3** for document storage, **PostgreSQL with pgvector** for vector-based searching, and **LangGraph** for multi-step logic in the **backend**. The **frontend** is built with Vite (React) and provides an intuitive user interface for document upload and chat interaction. The system is 100% TypeScript and uses modern UI components from shadcn/ui with Tailwind CSS styling.

---

## Repository Overview

```
rag/
├── README.md                # Project documentation
├── README-ENV.md            # Environment setup documentation
├── CLAUDE.md                # Claude AI instructions
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
│   │   ├── Readme.md        # Frontend-specific documentation
│   │   ├── package.json     # Frontend dependencies
│   │   ├── pnpm-lock.yaml   # Frontend lock file
│   │   ├── index.html       # HTML entry point
│   │   ├── tailwind.config.js # Tailwind CSS configuration
│   │   ├── postcss.config.js # PostCSS configuration
│   │   ├── public/          # Static assets
│   │   │   ├── env-test.html # Environment test page
│   │   │   └── test-api.html # API test page
│   │   └── src/
│   │       ├── App.tsx      # Main application component
│   │       ├── main.tsx     # Application entry point
│   │       ├── components/  # UI components
│   │       │   ├── ChatFeed.tsx     # Main chat feed component
│   │       │   ├── GraphPanel.tsx   # Graph visualization component
│   │       │   ├── Header.tsx       # Application header
│   │       │   ├── Sidebar.tsx      # Main sidebar component
│   │       │   ├── VectorStorePanel.tsx # Vector store configuration
│   │       │   ├── chat/            # Chat-related components
│   │       │   │   ├── ChatFeed.tsx   # Chat message display
│   │       │   │   ├── ChatInput.tsx  # Message input with actions
│   │       │   │   └── ChatMessage.tsx # Individual message component
│   │       │   ├── graph/           # Graph visualization components
│   │       │   │   ├── GraphPanel.tsx # Vector relationship visualization
│   │       │   │   ├── GraphNode.tsx  # Individual node component
│   │       │   │   └── KnowledgeGraphEditor.tsx # Editor for knowledge graphs
│   │       │   ├── sidebar/         # Sidebar components
│   │       │   │   ├── Sidebar.tsx    # Main sidebar container
│   │       │   │   └── SidebarItem.tsx # Individual sidebar item
│   │       │   ├── vector-store/    # Vector store components
│   │       │   │   ├── ChunkingSection.tsx # Text chunking settings
│   │       │   │   ├── CollapsibleSection.tsx # Collapsible panel
│   │       │   │   ├── EmbeddingModelSection.tsx # Embedding model settings
│   │       │   │   ├── MetadataOptionsSection.tsx # Metadata configuration
│   │       │   │   ├── PreprocessingSection.tsx # Text preprocessing options
│   │       │   │   ├── VectorDbSection.tsx # Database configuration
│   │       │   │   ├── index.ts     # Vector store exports
│   │       │   │   ├── sections/    # Additional section components
│   │       │   │   └── types.ts     # Vector store type definitions
│   │       │   └── ui/             # shadcn/ui components
│   │       │       ├── avatar.tsx   # User avatar component
│   │       │       ├── badge.tsx    # Badge component
│   │       │       ├── button.tsx   # Button with variants
│   │       │       ├── card.tsx     # Card container
│   │       │       ├── chat-input-area.tsx # Chat input area
│   │       │       ├── checkbox.tsx # Checkbox input
│   │       │       ├── collapsible.tsx # Collapsible panel
│   │       │       ├── dialog.tsx   # Modal dialog component
│   │       │       ├── form.tsx     # Form components
│   │       │       ├── input.tsx    # Text input
│   │       │       ├── label.tsx    # Form label
│   │       │       ├── progress.tsx # Progress indicator
│   │       │       ├── radio-group.tsx # Radio button group
│   │       │       ├── scroll-area.tsx # Scrollable container
│   │       │       ├── search-settings.tsx # Search configuration component
│   │       │       ├── select.tsx   # Dropdown select
│   │       │       ├── slider.tsx   # Range slider
│   │       │       ├── switch.tsx   # Toggle switch
│   │       │       ├── tabs.tsx     # Tabbed interface
│   │       │       └── textarea.tsx # Text area input
│   │       ├── contexts/
│   │       │   └── book-context.tsx # Document management context
│   │       ├── hooks/
│   │       │   ├── use-rag-pipeline.ts # Enhanced RAG operations hook
│   │       │   └── use-toast.ts    # Toast notifications
│   │       ├── lib/
│   │       │   ├── rag.ts          # RAG API functions with knowledge graph support
│   │       │   └── utils.ts        # Utility functions
│   │       ├── shared/
│   │       │   └── schema.ts       # Shared type definitions
│   │       ├── store/             # State management 
│   │       │   └── vectorStore.ts  # Vector store state management
│   │       ├── styles/            # Global styles and themes
│   │       │   ├── index.css      # Global CSS and Tailwind imports
│   │       │   └── theme.ts       # Theme tokens and variables
│   │       └── vite-env.d.ts      # Vite environment types
│   │
│   └── backend/             # Express.js + LangGraph backend
│       ├── Dockerfile.dev   # Development Dockerfile
│       ├── Readme.md        # Backend-specific documentation
│       ├── neo4j-log.md     # Neo4j logging information
│       ├── neo4j-summary.md # Neo4j usage summary
│       ├── package.json     # Backend dependencies
│       ├── pnpm-lock.yaml   # Backend lock file
│       ├── test-neo4j.ts    # Neo4j test script (TypeScript)
│       ├── tsconfig.json    # TypeScript configuration
│       ├── uploads/         # Directory for uploaded documents
│       │   ├── ansi.md      # Sample document for testing
│       │   └── sample_doc.md # Additional sample document
│       └── src/
│           ├── index.ts     # Server entry point
│           ├── config/      # Configuration
│           │   └── index.ts # Configuration variables and setup
│           ├── controllers/ # API route handlers
│           │   ├── chat.controller.ts     # Chat functionality
│           │   └── document.controller.ts # Document upload/processing
│           ├── middlewares/ # Express middlewares
│           │   └── upload.middleware.ts   # File upload handling
│           ├── mocks/       # Mock data
│           │   └── database.mock.ts       # Database mocks
│           ├── models/      # Data models
│           ├── routes/      # API route definitions
│           │   ├── chat.routes.ts         # Chat API routes
│           │   └── document.routes.ts     # Document API routes
│           ├── services/    # Business logic services
│           │   ├── agents/  # LangGraph agent definitions
│           │   │   ├── chat_rag/          # Chat RAG agent
│           │   │   │   └── knowledge_graph_builder/ # Knowledge graph builder agent
│           │   │   └── example_graph/     # Example LangGraph implementation
│           │   │       ├── configuration.ts # Agent configuration
│           │   │       ├── graph.ts       # Graph definition
│           │   │       ├── index_graph.ts # Graph entry point
│           │   │       ├── prompts.ts     # Agent prompts
│           │   │       ├── retrieval.ts   # Retrieval logic
│           │   │       ├── state.ts       # State management
│           │   │       ├── tests/         # Tests for the agent
│           │   │       │   ├── graph.int.test.ts # Integration tests
│           │   │       │   └── graph.test.ts     # Unit tests
│           │   │       └── utils.ts       # Agent utilities
│           │   ├── chat.service.ts        # Chat service with dual agent graphs
│           │   ├── document.service.ts    # Document processing service
│           │   ├── mock.service.ts        # Mock service
│           │   ├── neo4j.service.ts       # Neo4j vector store service
│           │   ├── postgres.service.ts    # PostgreSQL vector store
│           │   └── s3.service.ts          # AWS S3 integration
│           ├── types/       # TypeScript type definitions
│           │   └── express-session.d.ts   # Express session types
│           └── utils/       # Utility functions
│               └── logger.ts # Logging utility
│
├── infra/                  # Infrastructure configuration
│   ├── docker-compose.yml   # Main Docker Compose for all services
│   ├── docker-compose-dev.yml # Development Docker Compose with extended features
│   ├── neo4j/              # Neo4j configuration
│   │   ├── import/         # Import directory for Neo4j
│   │   └── plugins/        # Plugins for Neo4j
│   └── aws/                # AWS infrastructure
│       ├── ecs-neo4j-config/ # ECS configuration for Neo4j
│       │   ├── neo4j-fargate-service.md # Documentation
│       │   └── task-definition.json    # ECS task definition
│       └── s3-setup.md     # Documentation for S3 setup
│
├── packages/               # Shared libraries (if any)
│
└── scripts/                # Helper scripts
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
     - Buttons, cards, inputs, progress indicators, dialogs, and more
   - **Hooks and Utilities**:
     - `use-rag-pipeline.ts`: Core hook managing document processing and chat functionality
     - `use-toast.ts`: Notification management
     - `rag.ts`: API client functions for backend communication
   - **State Management**:
     - Context providers for document and application state
     - Store modules for vector store state management
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

5. **LangGraph** (Backend)  
   - The backend orchestrates the RAG workflow (chunking, embedding, retrieval, generation) with **LangGraph**.  
   - Code in `apps/backend/src/services/agents/`, with specialized agent implementations.

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
   # For full development environment with dual LangGraph agents:
   docker compose -f docker-compose-dev.yml up --build
   
   # For minimal setup:
   docker compose up --build
   ```
   This spins up Neo4j, PostgreSQL, LocalStack (S3 emulation), backend (Express + LangGraph), frontend (Vite).

   Alternatively, run them separately:
   ```bash
   pnpm --filter=backend dev
   pnpm --filter=frontend dev
   ```
   
   **Note**: To use the dual agentic LangGraph flows, make sure to set the required environment variables:
   ```bash
   export GOOGLE_API_KEY=your_gemini_api_key
   export OPENAI_API_KEY=your_openai_api_key
   ```

3. **AWS ECS Deployment**  
   The folder `infra/aws/ecs-neo4j-config/` or any Terraform/Copilot scripts define how to host Neo4j in ECS.

   The backend and frontend each have Dockerfiles you can build/push to ECR, then define ECS services.

   S3, PostgreSQL, and other resources can be configured via AWS console or IaC in the same folder.

4. **Credentials & Env Variables**  
   Manage environment variables (S3 buckets, Gemini API keys) through `.env` in dev and ECS secrets in production.

---

## RAG System Features

1. **Document Processing**:
   - Upload markdown documents directly.
   - Automatic chunking of documents for efficient processing.
   - Storage in S3 with metadata in Neo4j.

2. **Dual Vector Storage**:
   - Store embeddings in both Neo4j graph database and PostgreSQL with pgvector extension.
   - Compare retrieval results from both sources for improved accuracy.

3. **Gemini Embeddings**:
   - Generate high-quality embeddings using Google's Gemini model.
   - Store and retrieve embeddings from dual vector stores.

4. **Dual Agentic LangGraph Flows**:
   - **Chat RAG Agent**: Handles conversation context, vector retrieval, and response generation.
   - **Knowledge Graph Builder Agent**: Extracts structured entities and relationships from documents.
   - Type-safe state management with Zod schemas for both agent workflows.
   - Conditional routing between agents based on user preferences.
   - Multiple specialized nodes for document retrieval, entity extraction, and answer generation.

5. **Chat Interface with RAG Visualization**:
   - Ask questions about uploaded documents with visibility into the RAG pipeline.
   - View retrieved document chunks that inform the AI's responses.
   - Toggle between standard RAG and knowledge graph extraction modes.
   - Explore similarity scores and vector representations of relevant chunks.

6. **Knowledge Graph Extraction and Editing**:
   - AI-powered extraction of entities and relationships from documents.
   - Interactive editor for reviewing and modifying extracted knowledge graphs.
   - Add, edit, or remove entities and relationships before saving to Neo4j.
   - Visualize the knowledge graph structure with entity types and relationship labels.

7. **Vector Store Visualization**:
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

1. **Chat Feed with RAG Visualization**
   - **Message History**: Displays alternating user and AI messages in conversation format
   - **Retrieved Chunks Display**: Shows the document chunks retrieved by the RAG system
   - **Vector Search Results**: Displays similarity scores for each retrieved chunk
   - **Source Attribution**: Links retrieved chunks back to original documents with citations
   - **Automatic Scrolling**: Auto-scrolls to the latest message
   - **Empty State**: Helpful prompt when no conversation has started

2. **Input Controls**
   - **Text Input**: Full-width input field for entering questions
   - **Send Button**: Submits questions with loading state indicator
   - **RAG Options**: Toggle between standard RAG and knowledge graph extraction
   - **Clear Conversation**: Option to reset the current chat session

### Right Sidebar Components

1. **Knowledge Graph Editor**
   - **Entity Cards**: Interactive cards showing extracted entities with types/labels
   - **Relationship Visualization**: Shows connections between entities
   - **Edit Controls**: Add, modify, or remove entities and relationships
   - **Schema Reference**: Available entity types and relationship types
   - **Save Controls**: Submit edited knowledge graph to Neo4j

2. **Vector Visualization**
   - **Graph View**: Visual representation of document chunks and relationships
   - **Similarity Scores**: Shows relevance between query and retrieved chunks
   - **Source Attribution**: Links retrieved information back to original documents

3. **Technical Details**
   - **Embedding Information**: Technical details about vector embeddings
   - **Agent State Visualization**: Shows the current state of the LangGraph agents
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
  - Shadcn/UI component library for consistent design
  - Tailwind CSS for styling

- **Backend**:
  - Express.js with TypeScript for a robust API server (100% TypeScript)
  - Dual Agentic LangGraph flows for RAG and knowledge graph extraction
  - Neo4j database for graph-based data relationships and knowledge graphs
  - PostgreSQL with pgvector for secondary vector storage
  - RESTful API design with structured controllers and services
  - Google Gemini for embeddings and text generation
  - Zod schemas for type-safe state management

- **Infrastructure**:
  - Turborepo + pnpm for consolidated multi-app dev
  - Docker for local dev/prod builds
  - Neo4j on AWS ECS to store document relationships and knowledge graphs
  - S3 for storing document files
  - PostgreSQL with pgvector for comparison vector storage
  - LangGraph for creating agentic workflows with conditional routing

## Getting Started

### Prerequisites

- Node.js v18+ and pnpm
- Docker and Docker Compose
- Google Gemini API key (for embeddings)
- OpenAI API key (optional, for alternative LLM)

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

   Add your API keys to the `.env` file:
   - GOOGLE_API_KEY: Required for Gemini embeddings
   - OPENAI_API_KEY: Optional for alternative LLM

4. **Start the development environment**

   There are two options for running the application:

   **Option 1: Full stack with docker-compose-dev.yml (recommended)**
   ```bash
   cd infra
   docker compose -f docker-compose-dev.yml up
   ```

   This will start:
   - Neo4j database with APOC plugin (for graph operations)
   - PostgreSQL with pgvector extension (for vector embeddings)
   - LocalStack for S3 emulation
   - Backend Express server
   - Frontend Vite server

   **Option 2: Minimal setup with docker-compose.yml**
   ```bash
   cd infra
   docker compose up
   ```

   This starts a more basic version without LocalStack or some plugins.

5. **Testing the frontend with Docker Compose**

   To specifically test the frontend with the dual agentic flows for RAG and knowledge graph extraction:

   ```bash
   # Ensure API keys are set in your environment
   export GOOGLE_API_KEY=your_gemini_api_key
   export OPENAI_API_KEY=your_openai_api_key

   # Start the full stack with docker-compose-dev.yml
   cd infra
   docker compose -f docker-compose-dev.yml up
   ```

   The frontend implements:
   - A chat interface for querying documents using RAG
   - Knowledge graph visualization and editing capabilities
   - Document chunk retrieval and exploration
   - Options to enable/disable knowledge graph extraction

   **Testing knowledge graph extraction:**
   1. Upload a document through the sidebar
   2. Enter a query in the chat interface
   3. Toggle the "Extract Knowledge Graph" option
   4. View and edit extracted entities and relationships
   5. Save the knowledge graph to Neo4j

6. **Access the application**

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Neo4j Browser: http://localhost:7474 (login with neo4j/testpassword)
   - PostgreSQL: localhost:5432 (connect with postgres/password or postgres/postgrespassword)

## Architecture Highlights

### Dual Agentic LangGraph Flows

This system implements two specialized LangGraph agent workflows in the backend:

1. **Chat RAG Agent**
   - Handles conversation history and context tracking
   - Performs vector retrieval from Neo4j and PostgreSQL
   - Generates contextually relevant responses with retrieved chunks
   - Uses type-safe state management with Zod schemas

2. **Knowledge Graph Builder Agent**
   - Extracts structured entities and relationships from documents
   - Identifies entity types and relationship labels
   - Creates a formal knowledge graph representation
   - Maintains schema consistency for Neo4j storage
   - Returns editable extraction results to the frontend

The agents communicate through a router node that decides which flow to execute based on user preferences. This architecture allows for both traditional RAG functionality and advanced knowledge graph building within the same application.

### Frontend Visualization and Editing

The frontend provides transparent views into the RAG process:

1. **RAG Visualization**
   - Shows retrieved document chunks alongside AI responses
   - Displays similarity scores and source information
   - Provides context for how the system arrived at its answers

2. **Knowledge Graph Editor**
   - Interactive interface for reviewing extracted knowledge graphs
   - Entity and relationship cards with edit capabilities
   - Visual representation of the graph structure
   - Ability to add, modify, or remove graph elements
   - Save functionality to persist changes to Neo4j

## Conclusion

This RAG system provides a comprehensive solution for document processing and question answering with advanced knowledge graph capabilities. By leveraging dual vector stores and agentic LangGraph flows, it combines the strengths of graph databases, traditional vector search, and structured knowledge extraction.

The system offers unprecedented transparency into the RAG process, allowing users to see retrieved chunks and edit extracted knowledge graphs before persistence. This human-in-the-loop approach ensures higher quality knowledge graphs while maintaining the efficiency of automated extraction.

By following this architecture, you can easily build robust RAG applications that scale seamlessly in AWS. It's flexible for both local development and production-ready container deployments. Enjoy building your Multi-Vector Store RAG System with dual agentic workflows!