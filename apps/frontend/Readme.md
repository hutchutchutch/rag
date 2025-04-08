# RAG Frontend Application

This is the frontend for the RAG (Retrieval-Augmented Generation) system. It provides a user interface for uploading documents, visualizing vector embeddings, and interacting with the RAG chat interface.

## Path Aliases

This project uses absolute path imports instead of relative paths for better code organization and readability. The following aliases are configured:

- `@/*` - The base src directory
- `@components/*` - UI components
- `@hooks/*` - Custom React hooks
- `@contexts/*` - React context providers
- `@lib/*` - Utility functions and API interfaces
- `@shared/*` - Shared types and interfaces
- `@ui/*` - Reusable UI components

## Examples

Instead of:
```tsx
import { useRagPipeline } from '../../hooks/use-rag-pipeline';
import Button from '../ui/button';
```

Use:
```tsx
import { useRagPipeline } from '@hooks/use-rag-pipeline';
import Button from '@ui/button';
```

## Development

### Local Development

To start the development server:

```bash
pnpm dev
```

### Docker Development

Run using Dockerfile.dev:

```bash
# 1) Build the image from your Dockerfile.dev
docker build -f Dockerfile.dev -t frontend-dev .

# 2) Run the container with volume mounting for hot reload
docker run -it --rm \
  -p 5173:5173 \
  -v "$(pwd)":/app \
  frontend-dev
```

## Build

To build the project:

```bash
pnpm build
```

## Configuration

The path aliases are configured in:
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `.eslintrc.json` - ESLint import resolution

## Notes

When adding new files, always use the path aliases for imports to maintain consistency across the codebase.
