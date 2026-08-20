# PathForge AI

**PathForge AI** is an AI-powered personalized career and learning path SaaS platform. It analyzes a learner's current skills, experience, interests, and target career aspirations to identify skill gaps, generate tailored milestone-driven learning roadmaps, recommend vetted resources, projects, and assessments, provide transparent explanations for every recommendation, and adapt the roadmap dynamically based on learner progress.

---

## Vision

Navigating modern technical careers is challenging due to rapidly evolving skill demands, fragmented learning materials, and lack of individualized guidance. Most learning paths are static, one-size-fits-all lists that fail to account for a learner's existing background or changing industry needs.

PathForge AI transforms career development by treating learning roadmaps as adaptive, explainable graphs. By combining modern full-stack web technologies with intelligent AI/ML gap-analysis engines, PathForge AI empowers learners to reach their career goals with clarity, efficiency, and verifiable milestone tracking.

---

## Core Product Flow

```text
Learner Profile
      ↓
Career Goal
      ↓
Skill Analysis
      ↓
Skill Gap Detection
      ↓
Personalized Recommendations
      ↓
Learning Roadmap
      ↓
Progress Tracking & Verification
      ↓
Adaptive Recommendations
```

---

## Planned Technology Stack

> **Note on Implementation Status:** The technologies below represent the planned architectural stack. In Phase 0, only repository foundations and developer configurations are active. Functional application code will be introduced systematically in subsequent phases.

- **Frontend (`apps/web`):** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend (`apps/api`):** Node.js, Express, TypeScript
- **Database & ORM (`database`):** PostgreSQL, Prisma ORM
- **AI Service (`services/ai`):** Python, FastAPI, Embeddings, LLM Integration
- **Caching & Queue Infrastructure (`infra`):** Redis, Docker
- **Monorepo & Build Tooling:** pnpm workspaces, Turborepo, ESLint, Prettier

---

## Repository Structure

```text
pathforge-ai/
├── apps/
│   ├── web/                     # Frontend client application (React + Vite + TS)
│   └── api/                     # Core backend REST API (Express + TS)
├── services/
│   └── ai/                      # AI & recommendation service (Python + FastAPI)
├── packages/
│   ├── shared/                  # Shared types, validation schemas, and constants
│   ├── config/                  # Shared configuration (tsconfig, linting)
│   └── ui/                      # Shared design system and UI components
├── database/
│   ├── migrations/              # Database schema migrations
│   └── seed/                    # Development and test seed datasets
├── infra/
│   ├── docker/                  # Dockerfiles and compose setups
│   └── scripts/                 # Infrastructure and deployment automation
├── docs/
│   ├── architecture/            # System design and data flow documentation
│   ├── api/                     # REST API specs and contracts
│   ├── ai/                      # AI models, prompts, and evaluation docs
│   ├── product/                 # Product requirements, personas, and roadmaps
│   └── decisions/               # Architecture Decision Records (ADRs)
├── tests/
│   ├── integration/             # Multi-service integration test suites
│   ├── e2e/                     # End-to-end browser and workflow tests
│   └── fixtures/                # Test fixtures and shared test datasets
├── scripts/                     # Developer utility and maintenance scripts
├── .github/
│   └── workflows/               # CI/CD automation pipelines
├── .husky/                      # Git hooks configuration
├── .env.example                 # Environment variable templates
├── .gitignore                   # Version control ignore definitions
├── .editorconfig                # Universal IDE editor formatting
├── eslint.config.js             # Code linting rules
├── prettier.config.js           # Code formatting rules
├── package.json                 # Monorepo root manifest
├── pnpm-workspace.yaml          # Monorepo workspace configuration
├── turbo.json                   # Turborepo task pipeline configuration
└── README.md                    # Project documentation entry point
```

---

## Naming Conventions

To maintain strict consistency across teams:

- **Directories:** `kebab-case` (e.g., `learning-path/`, `skill-gap/`)
- **TypeScript files:** `kebab-case.ts` (e.g., `user-service.ts`, `auth-middleware.ts`)
- **React components:** `PascalCase.tsx` (e.g., `RoadmapCard.tsx`, `SkillBadge.tsx`)
- **Python modules:** `snake_case.py` (e.g., `skill_extractor.py`, `recommendation_engine.py`)
- **Environment variables:** `UPPER_SNAKE_CASE` (e.g., `DATABASE_URL`, `JWT_SECRET`)
- **Database tables / fields:** Prisma-standard PascalCase models with camelCase fields (mapped to snake_case DB columns where appropriate).

---

## Development Principles

1. **Modular Architecture:** Clear boundary separation between client, server API, shared packages, and AI micro-service.
2. **Type Safety:** Strict end-to-end TypeScript typings from database schemas through API contracts to the frontend UI.
3. **Testability:** Decoupled business logic designed for deterministic unit, integration, and end-to-end testing.
4. **Security by Design:** Never commit secrets; validate all incoming requests; keep AI credentials server-side; treat AI outputs as untrusted until validated against schemas.
5. **Explainable AI:** Every recommendation, skill gap, and roadmap milestone must include explainable reasoning for the learner.
6. **Measurable Recommendation Quality:** Continuous evaluation of curriculum paths against verified industry skills.
7. **Clean Git History:** Meaningful atomic commits adhering to conventional commit specifications.
8. **No Unnecessary Complexity:** Avoid premature optimization, excessive microservices, or complex distributed patterns before necessity arises.

---

## Security Guidelines

- **Zero-Secret Commits:** All secrets, keys, and tokens must reside exclusively in `.env` files which are ignored by Git.
- **Backend Isolation:** External AI vendor keys (OpenAI, Anthropic, etc.) are strictly kept inside server environments and never exposed to the frontend.
- **Input & Output Validation:** All client inputs and LLM structured outputs must pass schema validation (e.g., Zod / Pydantic) before persistence or consumption.
