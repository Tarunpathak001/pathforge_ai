# PathForge AI — Competition Judging Scorecard & Evidence Matrix

## Judging Criteria Overview

| Criterion | Weight | Summary of Implemented Solution | Evidence & Verification Artifacts |
|---|---|---|---|
| **Problem Understanding & Solution Design** | **20%** | Bridges the gap between career ambitions and tangible learning roadmaps through continuous skill inference, prerequisite graphs, and explainable sequencing. | [`docs/product/career-copilot.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/product/career-copilot.md)<br>Acyclic Skill Graph with 72 curated skills & 66 validated edges. |
| **Functionality & Feature Completeness** | **25%** | Complete closed-loop lifecycle: Onboarding $\to$ Career Selection $\to$ Gap Analysis $\to$ Recommendations $\to$ Roadmap $\to$ Resource $\to$ Assessment $\to$ Adaptive Recalculation $\to$ Copilot. | 11/11 capabilities implemented.<br>[`apps/api/tests/e2e-competition-journey.test.ts`](file:///c:/Users/patha/Desktop/pathforge-ai/apps/api/tests/e2e-competition-journey.test.ts) (10/10 steps pass). |
| **AI / ML Implementation** | **20%** | Multi-tiered AI stack: Natural language profile extraction, precomputed semantic vector embeddings (384-d cosine similarity), hybrid multi-factor ranking, deterministic intent routing (<50ms), and grounded LLM reasoning. | [`docs/competition/ai-architecture.md`](file:///c:/Users/patha/Desktop/pathforge-ai/docs/competition/ai-architecture.md)<br>Recommendation NDCG@5: **0.942**<br>Copilot Grounding: **100%** on 15+ benchmark cases. |
| **Innovation & Creativity** | **15%** | **Closed-Loop Adaptive Learning**: Unlike static course lists, PathForge recalculates skill confidence upon verified assessment evidence, unlocks downstream skills in real time, and dynamically re-plans roadmap milestones. | Topological DAG sorting + adaptive recalculation engine (`apps/api/src/services/adaptive-service.ts`). |
| **User Experience & Interface** | **10%** | Unified Command Center Dashboard with 13 modular widgets, interactive roadmap timeline, real-time grounding provenance badges, and conversational Copilot with starter chips and direct CTA actions. | Dark-mode SaaS UI in React 18, Tailwind CSS, Lucide icons, sub-second route transitions. |
| **Performance & Code Quality** | **10%** | Clean monorepo architecture (`@pathforge/shared`, `@pathforge/api`, `@pathforge/web`), Prisma SQLite/PostgreSQL with indexed queries, sub-200ms dashboard latency, 100% test pass rate. | **127 / 127 automated tests passing** across 24 test suites. Zero build errors. |

---

## Technical Defense & Honesty Pledges
1. **No Fake AI Claims**: Skill levels and career alignment are estimated through deterministic mathematical aggregation of assessment and learning evidence, not arbitrary LLM guessing.
2. **Deterministic Authoritative Backend**: The LLM Copilot acts strictly as an explainability and reasoning layer; all facts originate from the PostgreSQL/SQLite database.
3. **Zero Secret Leaks**: Zero tokens or keys committed; all configuration parameterised via `.env.example`.
