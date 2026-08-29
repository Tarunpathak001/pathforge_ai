# PathForge AI — Final Master Runbook & Startup Guide

> **Target Platform**: Windows (PowerShell) / Linux / macOS  
> **Package Manager**: `pnpm` (v9.0.0+)  
> **Node.js Runtime**: `>= 20.0.0` (LTS recommended)  
> **Python Runtime**: `3.11+` (for optional Python AI service)

---

## 1. Quick One-Command Setup & Launch (Recommended)

In a single PowerShell terminal at the repository root (`c:\Users\patha\Desktop\pathforge-ai`):

```powershell
# 1. Install all monorepo dependencies
pnpm install

# 2. Push Prisma database schema and seed canonical demo dataset
pnpm --filter @pathforge/api prisma db push
pnpm --filter @pathforge/api db:seed

# 3. Start development servers concurrently
pnpm dev
```

### URLs After Launch:
- 🌐 **Web Client**: [http://localhost:3000](http://localhost:3000) (or [http://localhost:5173](http://localhost:5173))
- ⚡ **Backend REST API**: [http://localhost:4000/api](http://localhost:4000/api) (or [http://localhost:3001/api](http://localhost:3001/api))
- 💓 **Health Liveness Probe**: [http://localhost:4000/health](http://localhost:4000/health)
- 📊 **Health Readiness Probe**: [http://localhost:4000/health/ready](http://localhost:4000/health/ready)

---

## 2. Multi-Terminal Service Startup (Granular Control)

If you prefer running services in dedicated terminals for granular log visibility:

### Terminal 1 — Database Seeding & Backend API Server
```powershell
cd c:\Users\patha\Desktop\pathforge-ai
pnpm --filter @pathforge/api prisma db push
pnpm --filter @pathforge/api db:seed
pnpm --filter @pathforge/api dev
```
*Output: `[PathForge API] Server listening on http://localhost:4000`*

### Terminal 2 — Frontend Client Application
```powershell
cd c:\Users\patha\Desktop\pathforge-ai
pnpm --filter @pathforge/web dev
```
*Output: `VITE v5.4.21 ready in 250 ms ➜ Local: http://localhost:3000/`*

### Terminal 3 (Optional) — Python FastAPI AI Intelligence Service
```powershell
cd c:\Users\patha\Desktop\pathforge-ai\services\ai
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: If the Python AI service is not running, the Node API automatically activates its high-performance built-in deterministic NLP extractor fallback.*

---

## 3. Automated Verification Commands

Run the full automated test suite and production build verification across all packages:

```powershell
# 1. Run Shared Package Unit Tests (48 tests)
pnpm --filter @pathforge/shared test

# 2. Run API Integration Tests & E2E Golden Journey (79 tests)
pnpm --filter @pathforge/api test

# 3. Run Python AI Service Tests (6 tests)
powershell -Command "cd services/ai ; .\.venv\Scripts\pytest"

# 4. Run Frontend Production Bundle Build
pnpm --filter @pathforge/web build
```

**Total Test Coverage: 133 / 133 tests passed (100% success rate).**

---

## 4. Resetting Demo Learner State

To reset the canonical demo learner (**Alex Chen**) to the clean ~72% alignment state at any time:

```powershell
pnpm --filter @pathforge/api db:seed
```

This operation is **100% idempotent** and safely re-initializes:
- 72 curated skills & 66 validated prerequisite edges
- 15 industry careers & 92 career-skill mappings
- 50 curated learning resources with precomputed semantic vector embeddings
- 6 domain assessments with question banks
- Realistic demo learner profile (`demo-learner-id`) with active Milestone 2.
