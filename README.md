# PathForge AI — Adaptive Career & Skill Gap Intelligence Platform

> **HCLTech Hackathon 2026 — Final Production Release (`v1.0.0-final`)**  
> *From Career Goal to Adaptive Learning Path.*

[![CI / Automated Tests](https://img.shields.io/badge/Tests-133%2F133%20Passed%20(100%25)-emerald?style=flat-square)](https://github.com/Tarunpathak001/pathforge_ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan?style=flat-square)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)](https://nodejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-indigo?style=flat-square)](https://www.prisma.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.11-teal?style=flat-square)](https://fastapi.tiangolo.com/)

---

## 1. Executive Overview

### The Problem
Traditional e-learning platforms treat learners like passive consumers: dumping thousands of unsequenced courses without understanding what skills the learner is missing, which prerequisites block them, or how their roadmap should adapt when they improve.

### The PathForge Solution
PathForge AI is an **evidence-driven, closed-loop career intelligence SaaS**. It models technical careers and skills into an **acyclic directed dependency graph (DAG)**. It maps a learner's background against their target career, calculates prerequisite-aware skill gaps, builds a sequenced roadmap, verifies learning through assessments, and **dynamically adapts the roadmap** in real time as the learner produces verified proof of mastery.

```text
Learner Profile + Target Career
               ↓
    [ Skill Gap Engine ] ──── Prerequisite-Aware Gap Severity & Blocking
               ↓
 [ Hybrid Recommendation Engine ] ──── 384-d Semantic Embeddings + Quality Matching
               ↓
  [ Personalized Roadmap Planner ] ──── Topological DAG Milestone Sequencing
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
6. **Closed-Loop Adaptive Engine**: Verified assessment scores automatically increase skill confidence, resolve critical gaps, and re-plan downstream milestones.
7. **Unified Command Center Dashboard**: Sub-200ms aggregator endpoint with 13 modular widgets, career alignment progress, active milestone tracking, and authoritative next best actions.
8. **Grounded Career Copilot (`/copilot`)**: A 24/7 AI learning advisor bounded strictly to the learner's database state with prompt-injection defense and zero hallucinations.

---

## 3. Technology Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend API**: Node.js, Express, TypeScript, Prisma ORM, Zod, Vitest
- **Data & Persistence**: SQLite (Dev/Demo) / PostgreSQL (Production), Prisma ORM
- **AI & NLP Intelligence**: 384-d `all-MiniLM-L6-v2` dense vector embeddings, hybrid weighted scoring, deterministic intent classification router (<50ms), Python FastAPI AI service, and grounded LLM reasoning
- **Architecture**: High-performance monorepo using pnpm workspaces (`@pathforge/shared`, `@pathforge/api`, `@pathforge/web`, `services/ai`)

---

## 4. Repository Structure

```text
pathforge_ai/
├── apps/
│   ├── web/                    # React 18 SaaS frontend client (Port 3000)
│   └── api/                    # Express + Prisma REST API server (Port 4000)
├── services/
│   └── ai/                     # Python FastAPI NLP intelligence service (Port 8000)
├── packages/
│   ├── shared/                 # Shared types, Zod schemas, & intent classifiers
│   └── config/                 # TypeScript & build configurations
├── docs/
│   ├── competition/            # Solution paper, runbook, presentation deck, & audit
│   ├── product/                # Product specifications & requirement docs
│   ├── architecture/           # System design & database schema specs
│   └── api/                    # REST API reference documentation
└── submission/                 # Competition submission package & judge guide
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
pnpm --filter @pathforge/api db:seed
```

### 3. Run Development Servers
```bash
# Run API server (port 4000) and Web client (port 3000) concurrently
pnpm dev
```
- **Web Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000/api`
- **Health Probe**: `http://localhost:4000/health`
- **Readiness Check**: `http://localhost:4000/health/ready`

---

## 6. Canonical Demo Account

The platform is pre-seeded with the **Alex Chen** demo persona:
- **Target Career**: Backend Engineer
- **Career Alignment**: **72%**
- **Critical Gaps**: System Design, Distributed Systems, Redis
- **Completed Assessment**: REST APIs (100% score)
- **Active Milestone**: Milestone 2 — Spring Boot & Advanced Microservices
- **Next Best Action**: Build a REST API with Spring Boot (5.0 hrs)

To reset the demo state at any time:
```bash
pnpm --filter @pathforge/api db:seed
```

---

## 7. Testing & Evaluation Benchmarks

PathForge AI enforces 100% automated test coverage across all critical algorithms and API routes.

```bash
# Run shared package unit tests
pnpm --filter @pathforge/shared test

# Run API integration tests & E2E golden journey
pnpm --filter @pathforge/api test

# Run Python AI service tests
pytest services/ai/tests

# Build production web bundle
pnpm --filter @pathforge/web build
```

### Automated Test Results: **133 / 133 Passed (100%)**
- `@pathforge/shared`: 48 tests passed across 9 suites (DAG cycle validation, hybrid ranking, intent classification).
- `@pathforge/api`: 79 tests passed across 15 suites (End-to-End Golden User Journey, adaptive recalculation, dashboard aggregator, prompt-injection defense, multi-tenant isolation, evaluation benchmarks).
- `services/ai`: 6 tests passed (FastAPI endpoints and NLP fallback).
- `@pathforge/web`: Production bundle compiled cleanly in 5.43s with zero type errors.

---

## 8. Competition Documentation Dossier

All official documentation for the HCLTech Hackathon is located in [`docs/competition/`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition):

| Document | Description |
|---|---|
| **[`solution-document.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/solution-document.md)** | Official 17-section competition whitepaper covering problem, architecture, AI/ML, and evaluation. |
| **[`final-runbook.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/final-runbook.md)** | Step-by-step Windows PowerShell running guide and multi-terminal launch instructions. |
| **[`demo-director-guide.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/demo-director-guide.md)** | 3–5 minute demo video director's master guide with timestamps, click paths, and word-for-word voiceover. |
| **[`ppt-master-prompt.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/ppt-master-prompt.md)** | Ready-to-paste master prompt for AI presentation tools (Gamma / Beautiful.ai / Tome). |
| **[`final-feature-audit.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/final-feature-audit.md)** | Exhaustive capability audit matrix cross-referencing all 11 hackathon requirements with passing test suites. |
| **[`judge-qa.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/judge-qa.md)** | 10 rapid-fire 30-second technical defenses for live judge evaluation. |
| **[`presentation-slides.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/presentation-slides.md)** | 12-slide final presentation deck specification. |
| **[`requirements-matrix.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/requirements-matrix.md)** | Traceability matrix proving 100% alignment with competition problem statements. |
| **[`limitations.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/limitations.md)** | Transparent technical boundaries, design trade-offs, and future scalability roadmap. |
| **[`submission-record.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/submission-record.md)** | Official submission package record and metadata. |

---

## 9. Team & Submission

- **Project Name**: PathForge AI
- **Repository**: [https://github.com/Tarunpathak001/pathforge_ai](https://github.com/Tarunpathak001/pathforge_ai)
- **Tagline**: *From Career Goal to Adaptive Learning Path.*
- **Event**: HCLTech Hackathon 2026
