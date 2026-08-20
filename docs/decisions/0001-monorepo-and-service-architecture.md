# ADR-0001: Monorepo and Service Architecture

## Status

Accepted

## Context & Problem Statement

PathForge AI is an AI-powered personalized career and learning path SaaS developed under a competitive hackathon timeline by a 4-person engineering team. We must choose an architecture that balances rapid development velocity, maintainability, type safety, AI/ML ecosystem integration, and operational simplicity.

## Decision Drivers

* High development velocity and seamless collaboration across 4 developers.
* Strong type safety across client, backend, and shared domain models.
* Optimal language ecosystem choices for both web development and AI/ML processing.
* Reliable relational modeling for complex career/skill taxonomies and user roadmaps.
* Elimination of premature operational complexity and distributed systems overhead.

## Architecture Decisions

### 1. Monorepo (pnpm + Turborepo)
* **Rationale:** Housing the frontend, API, shared packages, database schemas, and AI service in a single monorepo ensures atomic commits, unified tooling, instant type sharing via `packages/shared`, and coordinated CI workflows without multi-repo synchronization overhead.

### 2. Modular Express (Node.js + TypeScript) Backend
* **Rationale:** A modular monolithic Express application written in TypeScript provides robust REST API capabilities, seamless integration with Prisma ORM, lightweight middleware composition, and shared type definitions with the React frontend. Internal modular boundaries (by domain/feature) allow maintainable scaling without network latency between internal modules.

### 3. Dedicated Python (FastAPI) AI Service
* **Rationale:** Python is the de facto standard for AI/ML, NLP, vector embeddings, and LLM orchestration (LangChain, LlamaIndex, NumPy, PyTorch/HuggingFace). FastAPI provides high-performance asynchronous API endpoints, native OpenAPI generation, and strict data validation via Pydantic. Isolating AI logic in a Python service allows us to leverage Python's ML ecosystem while keeping the core business API in TypeScript.

### 4. PostgreSQL as the Primary Database
* **Rationale:** PathForge AI's domain model (users, career targets, skill trees, roadmaps, milestones, assessments) is inherently relational with rich foreign-key relationships. PostgreSQL offers ACID compliance, robust indexing, JSONB support for semi-structured data, and smooth integration with the Prisma ORM.

### 5. Redis for Caching and Background Processing
* **Rationale:** LLM invocations and embedding computations can be expensive and latency-sensitive. Redis provides low-latency caching for frequent skill queries, vector caching, and session storage. Furthermore, Redis enables lightweight background task queues (e.g., BullMQ or Celery) for long-running roadmap generations without blocking HTTP request threads.

### 6. Avoiding Unnecessary Microservices
* **Rationale:** Decomposing into dozens of granular microservices introduces distributed tracing overhead, network latency, complex deployments, and split transaction management. A pragmatic structure composed of a frontend, a core modular API, and a specialized AI service provides clear separation of concerns while keeping operations lean and developer velocity high.

## Consequences

* **Positive:**
  * Clean separation of concerns with minimal operational overhead.
  * Native Python ecosystem for AI/ML and TypeScript ecosystem for web/API.
  * Shared types across frontend and API packages.
  * Fast local development with Turborepo task caching.
* **Negative / Trade-offs:**
  * Polyglot environment (TypeScript + Python) requires maintaining dual package/environment managers (pnpm + venv/pip/poetry).
