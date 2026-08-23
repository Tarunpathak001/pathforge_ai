# Recommendation Engine Architecture

```
                      +-----------------------------+
                      |   Learner Profile State     |
                      | (Skills, Level, Preferences)|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Skill Gap Intelligence     |
                      |  (Prioritized Gap Items)    |
                      +--------------+--------------+
                                     |
                                     v
   +--------------------+     +------+----------------------+
   | Curated Resource   | --> | Recommendation Pipeline     |
   | Database & Vectors |     | 1. Candidate Retrieval      |
   +--------------------+     | 2. Hybrid Deterministic     |
                              |    Scoring (7 Subscores)    |
                              | 3. Prereq & Diff Penalties  |
                              | 4. Diversity Re-ranking     |
                              | 5. Explainability Builder   |
                              +--------------+--------------+
                                             |
                                             v
                              +-----------------------------+
                              | Ranked, Grouped Recs (v1)   |
                              | (Postgres/SQLite Persistent)|
                              +-----------------------------+
```

## 1. System Pipeline Stages

### Stage 1: Gap Context Ingestion
The engine receives the learner's active skill gap analysis report (produced by Phase 3), extracting critical and developing gaps with their priority, importance weight, readiness status, and prerequisite graph dependencies.

### Stage 2: Candidate Retrieval & Semantic Matching
- All active curated educational resources matching target skills are loaded from the database.
- 64-dimensional semantic text vectors (generated using subword n-gram hashing and L2-normalized) calculate cosine similarity between candidate resources and the learner's query context.
- If semantic vector calculation is bypassed or offline, the engine seamlessly switches to deterministic fallback mode, re-normalizing the remaining 6 weights.

### Stage 3: Multi-Factor Scoring
The engine executes the deterministic hybrid scoring equation:
$$\text{Score} = w_{\text{sem}} S_{\text{sem}} + w_{\text{cov}} S_{\text{cov}} + w_{\text{car}} S_{\text{car}} + w_{\text{dif}} S_{\text{dif}} + w_{\text{pre}} S_{\text{pre}} + w_{\text{prf}} S_{\text{prf}} + w_{\text{qua}} S_{\text{qua}}$$

Where:
- $w_{\text{sem}} = 0.30$
- $w_{\text{cov}} = 0.25$
- $w_{\text{car}} = 0.15$
- $w_{\text{dif}} = 0.10$
- $w_{\text{pre}} = 0.08$
- $w_{\text{prf}} = 0.07$
- $w_{\text{qua}} = 0.05$

### Stage 4: Diversity Re-ranking & Deduplication
To ensure learners receive balanced learning options (combining conceptual reading with practical implementation), diversity penalties are applied when consecutive resources of the exact same `resourceType` appear for the same skill gap.

### Stage 5: Explainability Synthesis
For each candidate passing the score threshold ($\text{FinalScore} \ge 0.45$), human-readable rationales are synthesized from the concrete scoring components.
