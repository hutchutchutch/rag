# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands
- Build: `pnpm build` or `turbo run build`
- Dev: `pnpm dev` or `turbo run dev`
- Frontend only: `pnpm dev:frontend` or `turbo run dev --filter=frontend`
- Lint: `pnpm lint` or `turbo run lint`
- TypeCheck: `pnpm build` (includes type checking)

## Code Style Guidelines
- **TypeScript**: Use strong typing (no `any` unless necessary)
- **Components**: Use shadcn/ui components from `@/components/ui/*`
- **Styling**: Use Tailwind CSS classes only, no inline styles or hex colors
- **CSS Variables**: Reference tokens in `index.css` and `tailwind.config.js`
- **Imports**: Use absolute imports with `@/` prefix
- **Error Handling**: Use proper try/catch blocks in async functions
- **Backend**: Use express routing patterns and controller/service separation
- **File Structure**: Follow existing patterns for component organization
- **Naming**: Use camelCase for variables/functions, PascalCase for components/classes