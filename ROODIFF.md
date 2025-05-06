# ROODIFF.md

## Purpose

This file documents the changes made to the `.roo` rules directory to ensure congruence with the monorepo approach described in the project README.md files. Each change is justified with reference to monorepo best practices and the specific structure of this repository.

---

## Summary of Changes

### 1. General Rules (`.roo/rules/rules.md`)

**Added:**
- Explicit references to the monorepo structure (`apps/`, `packages/`, `infra/`), and the importance of maintaining clear boundaries between app, infra, and shared code.
- Guidance on using `pnpm` workspaces and Turborepo pipelines for dependency management and task orchestration.
- Requirement to use workspace-level scripts for cross-app operations and to avoid duplicating scripts/configs in individual apps.
- Section on Docker-based workflows, referencing the use of `Dockerfile.dev` and `Dockerfile.prod` in both frontend and backend, and the use of `infra/docker-compose*.yml` for local development.
- Best practices for environment variable and configuration management, emphasizing `.env.example` files in each app and shared secrets via AWS Parameter Store.
- Reference to unified deployment scripts and CI/CD practices as described in `infra/aws/README.md`.

**Rationale:**  
The monorepo approach relies on shared tooling, consistent configuration, and clear separation of concerns. The original rules did not mention monorepo-specific workflows, which are critical for maintainability and developer experience in this setup.

---

### 2. Code Mode Rules (`.roo/rules-code/rules.md`)

**Added:**
- Guidance to use path aliases (e.g., `@components`, `@hooks`) in the frontend, as configured in `tsconfig.json` and `vite.config.ts`.
- Note to always use workspace-level `pnpm` commands for installing dependencies and running scripts, to avoid version drift.
- Reference to Docker-based development and the need to keep Dockerfiles and compose files in sync with app and infra changes.
- Emphasis on not hardcoding environment values, and instead using `.env.example` and AWS Parameter Store for secrets.
- Reminder to check for and update shared types/interfaces in `packages/` if/when they are introduced.

**Rationale:**  
These changes ensure that code contributions follow the monorepo's conventions for imports, dependency management, and environment configuration, reducing friction and errors across teams.

---

### 3. Architect, DevOps, and Integration Mode Rules

**Added:**
- Requirement to design and document system boundaries in terms of monorepo structure (apps, infra, shared packages).
- DevOps rules updated to reference unified deployment scripts, Docker Compose, and AWS ECS practices.
- Integration rules updated to ensure that cross-app and cross-service integrations are documented and tested in the context of the monorepo.

**Rationale:**  
Architectural and operational decisions in a monorepo must account for the shared codebase and deployment pipelines. These updates ensure that all modes operate with an awareness of the monorepo's structure and workflows.

---

### 4. Documentation and Onboarding

**Added:**
- Reference to the root `README.md` and app-level `Readme.md` files as canonical sources for project structure and workflow.
- Guidance to update these docs when making structural or workflow changes in the monorepo.

**Rationale:**  
Keeping documentation in sync with the codebase is especially important in a monorepo, where changes can affect multiple apps and services.

---

## Conclusion

These changes align the `.roo` rules with the actual practices and requirements of a modern Turborepo/pnpm monorepo, ensuring that all contributors and AI agents operate with a shared understanding of the project's structure and workflows.