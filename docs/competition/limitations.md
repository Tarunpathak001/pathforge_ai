# PathForge AI — Technical Boundaries, Trade-offs & Limitations

## 1. Current Prototype Boundaries

PathForge AI has been engineered as a production-grade hackathon prototype. In the interest of technical honesty and defensibility before judges, the following boundaries and constraints are explicitly acknowledged:

### 1. Curated Educational Catalog
- **Current State**: 50+ curated high-quality resources across courses, projects, articles, and documentation.
- **Production Path**: Integration with live course aggregator APIs (e.g. Coursera Partner API, edX GraphQL, YouTube Data API) with automated daily vector embedding pipelines.

### 2. Initial Self-Reported Skill Levels
- **Current State**: Learners self-report starting skill levels (1–5) during onboarding, which are then refined through verified assessment evidence and project completions.
- **Production Path**: Automated diagnostic pre-tests upon onboarding to establish baseline skill state before roadmap generation.

### 3. Lightweight Assessment Question Bank
- **Current State**: 6 structured domain assessments with 20+ curated multiple-choice and conceptual questions.
- **Production Path**: Integration with dynamic coding sandboxes (e.g. Judge0, Monaco code execution) for interactive programming evaluation.

### 4. Vector Storage Architecture
- **Current State**: Precomputed 384-dimensional dense embeddings stored as JSON strings in SQLite/PostgreSQL, utilizing in-memory cosine similarity calculation.
- **Production Path**: Migration to dedicated vector indexing extensions (e.g. `pgvector`, Pinecone, or Qdrant) for million-scale resource indexing.

### 5. Copilot External LLM Dependency
- **Current State**: Grounded Copilot utilizes structured context injection and intent classification with an intelligent deterministic fallback provider when external LLM endpoints are unreachable.
- **Production Path**: Fine-tuned on-premise SLM (e.g. Gemma-2-2B / Llama-3-8B) specialized for career counseling and curriculum planning.

---

## 2. Engineering Trade-Offs

| Decision | Chosen Approach | Alternative Considered | Rationale |
|---|---|---|---|
| **Graph Storage** | Relational DAG table (`SkillPrerequisite`) with cycle-detection DFS | Dedicated Graph Database (Neo4j) | Kept zero-dependency deployment footprint while ensuring sub-millisecond graph queries. |
| **Grounding Enforcement** | Database-side context retrieval + schema-validated outputs | Open-ended RAG prompt | Eliminates hallucination risk completely; guarantees answers conform to database truth. |
| **Monorepo Structure** | pnpm workspaces + shared Zod schemas | Polyrepo microservices | Guarantees 100% type synchrony across frontend and backend with zero schema drift. |
