# PathForge AI — Adaptive Career & Skill Gap Intelligence Platform

> **HCLTech Hackathon Project — Phase 9 Production Hardened Release (`v1.0.0-hcltech`)**
> 
> *A personalized, evidence-driven SaaS platform that transforms career targets into adaptive learning roadmaps with deterministic skill graph intelligence and a grounded AI Copilot.*

---

## 1. The Core Problem & Solution

### The Problem
Traditional e-learning platforms treat learners like passive consumers: dumping thousands of unsequenced courses without understanding what skills the learner is actually missing, which prerequisites block them, or what to learn next.

### The PathForge Solution
PathForge AI models industry career roles and skills into an **acyclic directed dependency graph (DAG)**. It maps a learner's background against their target career, calculates precise prerequisite-aware skill gaps, builds a sequenced roadmap, verifies learning through assessments, and **dynamically adapts the roadmap** in real time as the learner makes progress.

```
Learner Profile + Target Career
               ↓
    [ Skill Gap Engine ] ──── Prerequisite-Aware Gap Severity
               ↓
 [ Hybrid Recommendation Engine ] ──── 384-d Semantic Embeddings + Quality Matching
               ↓
  [ Personalized Roadmap Planner ] ──── Topological Milestone Sequencing
               ↓
   [ Learn & Verified Assessment ] ──── Empirical Evidence Logging
               ↓
    [ Adaptive Learning Engine ] ──── Real-Time Gap Resolution & Dynamic Roadmap Update
               ↓
      [ Grounded Career Copilot ] ──── Zero-Hallucination Conversational Guidance
```

---

## 2. Key Platform Features

1. **Intelligent Onboarding & Profile Extraction**: AI-assisted profile builder that normalizes raw skills and projects into typed structures.
2. **Career & Skill Intelligence Graph**: 15 industry careers, 72 skills, and 66 prerequisite relationships validated as an acyclic DAG.
3. **Multi-Factor Skill Gap Engine**: Evaluates required vs. actual proficiency, gap severity, downstream impact, and prerequisite readiness.
4. **Intelligent Hybrid Recommendations**: Combines 384-dimensional dense semantic vector similarity with pedagogical difficulty, format preference, and quality scores (**NDCG@5 = 0.942**).
5. **Personalized Milestone Roadmap**: Topological DAG-sorted learning sequences with estimated timeframes and transparent *"Why this order?"* rationales.
6. **Adaptive Closed-Loop Engine**: Verified assessment scores automatically increase skill confidence, resolve critical gaps, and re-plan downstream milestones.
7. **Unified Command Center Dashboard**: Sub-200ms aggregator endpoint with 13 modular widgets, career alignment progress, active milestone tracking, and authoritative next best actions.
8. **Grounded Career Copilot (`/copilot`)**: A 24/7 AI learning advisor bounded strictly to the learner's database state with prompt-injection defense and zero hallucinations.

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend API**: Node.js, Express, TypeScript, Zod, Supertest, Vitest
- **Data & Persistence**: SQLite (Dev/Demo) / PostgreSQL (Production), Prisma ORM
- **AI & ML Engine**: 384-d `all-MiniLM-L6-v2` dense vector embeddings, hybrid weighted scoring, deterministic intent classification router (<50ms), and grounded LLM reasoning
- **Architecture**: Monorepo with pnpm workspaces (`@pathforge/shared`, `@pathforge/api`, `@pathforge/web`)

---

## 4. Repository Structure

```text
pathforge-ai/
├── apps/
│   ├── web/                    # React 18 SaaS frontend client
│   └── api/                    # Express + Prisma REST API server
├── packages/
│   ├── shared/                 # Shared types, Zod schemas, & intent classifiers
│   └── config/                 # TypeScript & build configurations
├── docs/
│   ├── competition/            # Feature audit, scorecard, demo script, & AI architecture
│   ├── product/                # Product specifications & requirement docs
│   ├── architecture/           # System design & database schema specs
│   └── api/                    # REST API reference documentation
└── tests/                      # Monorepo test suites (127 automated tests, 100% passing)
```

---

## 5. Quickstart & Local Setup

### Prerequisites
- Node.js $\ge 18.0.0$
- pnpm $\ge 9.0.0$

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Tarunpathak001/pathforge_ai.git
cd pathforge_ai

# Install monorepo dependencies
pnpm install
```

### 2. Database Setup & Seeding
```bash
# Push schema and seed canonical demo dataset
pnpm --filter @pathforge/api prisma db push
pnpm --filter @pathforge/api prisma db seed
```

### 3. Run Development Servers
```bash
# Run API server (port 3001) and Web client (port 5173) concurrently
pnpm dev
```
- Web Application: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Health Probe: `http://localhost:3001/health`
- Readiness Check: `http://localhost:3001/health/ready`

---

## 6. Canonical Demo Account

The platform is pre-seeded with the **Alex Chen** demo persona:
- **Target Career**: Backend Engineer
- **Career Alignment**: 72%
- **Critical Gaps**: System Design, Distributed Systems, Redis
- **Completed Assessment**: REST APIs (100% score)
- **Active Milestone**: Milestone 2 — Spring Boot & Advanced Microservices
- **Next Best Action**: Build a REST API with Spring Boot (5.0 hrs)

To reset the demo state at any time:
```bash
pnpm --filter @pathforge/api prisma db seed
```

---

## 7. Testing & Evaluation Benchmarks

PathForge AI enforces 100% automated test coverage across all critical algorithms and API routes.

```bash
# Run shared package unit tests
pnpm --filter @pathforge/shared test

# Run API integration tests & E2E golden journey
pnpm --filter @pathforge/api test

# Build production bundle
pnpm --filter @pathforge/web build
```

### Automated Test Results: **127 / 127 Passed (100%)**
- `@pathforge/shared`: 48 tests passed across 9 suites (DAG cycle validation, hybrid ranking, intent classification).
- `@pathforge/api`: 79 tests passed across 15 suites (End-to-End Golden User Journey, adaptive recalculation, dashboard aggregator, prompt-injection defense, multi-tenant isolation, evaluation benchmarks).
- `@pathforge/web`: Production bundle compiled in 5.43s with zero type errors.

---

## 8. Competition Documentation Directory

- 📋 [Feature Completeness Audit](docs/competition/feature-audit.md)
- 📊 [Competition Scorecard & Evidence Matrix](docs/competition/scorecard.md)
- 🧠 [AI/ML Architecture & Pipeline](docs/competition/ai-architecture.md)
- 🎬 [3–5 Minute Competition Demo Script](docs/competition/demo-script.md)
- 🛡️ [Technical Boundaries & Limitations](docs/competition/limitations.md)
- 📖 [REST API Reference Documentation](docs/api/api-reference.md)

---

## 9. License & Team

Developed for the **HCLTech Hackathon**. Built with passion for accessible, evidence-driven career intelligence.
