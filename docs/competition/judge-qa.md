# PathForge AI — Judge Defense & Rapid Q&A Preparation Guide

This guide prepares the team for the technical interview and live Q&A session with competition judges. Each answer is formulated to be delivered crisply within 30 seconds.

---

### Q1: What is the core innovation of PathForge AI?
> **Answer**:  
> "The innovation isn't just recommending courses or wrapping an LLM. PathForge creates a closed, evidence-driven feedback loop between career requirements, prerequisite graphs, verified assessment evidence, and adaptive roadmaps. When a learner passes an assessment, the system mathematically updates skill confidence, resolves gaps, unlocks downstream prerequisites, and dynamically re-sequences the roadmap in real time."

---

### Q2: Why not just use ChatGPT or a custom GPT?
> **Answer**:  
> "A generic LLM has no concept of an authoritative learner database, prerequisite dependency graphs, or progress evidence. It cannot verify whether you actually passed a quiz, nor can it prevent hallucinations about your personal completion history. PathForge uses deterministic backend engines as the single source of truth and uses the LLM strictly for natural-language reasoning over verified database state."

---

### Q3: Where exactly is the AI/ML in this system?
> **Answer**:  
> "We implement AI across five specific layers:  
> 1. **NLP Profile Extraction**: Structured JSON entity extraction from unstructured text.  
> 2. **384-dimensional Dense Embeddings**: `all-MiniLM-L6-v2` for semantic resource representation.  
> 3. **Hybrid Recommendation Ranking**: Combining cosine similarity with difficulty, format, and pedagogical quality.  
> 4. **Bayesian Evidence Inference**: Updating skill confidence from assessment scores.  
> 5. **Grounded Conversational LLM**: Fast deterministic intent classification with context-bound prompt generation."

---

### Q4: How do you prevent the LLM from hallucinating?
> **Answer**:  
> "We enforce two strict invariants:  
> First, the LLM never determines skill levels or completion status—the backend database does.  
> Second, we inject authoritative minimal facts into the context and instruct the model to explicitly state if information is missing rather than inventing facts. In our evaluation benchmark across 35+ test prompts, our hallucination rate is 0.0%."

---

### Q5: How do you calculate prerequisite readiness and skill gaps?
> **Answer**:  
> "We model careers and skills as a Directed Acyclic Graph (DAG) with 72 skills and 66 prerequisite edges, validated by DFS cycle detection. A gap's severity is the delta between required and current level, weighted by career importance. A skill is flagged as `BLOCKED` if its prerequisite skills fall below required thresholds, ensuring learners only see actionable, unblocked recommendations."

---

### Q6: How do you know the learner actually improved their skill?
> **Answer**:  
> "We distinguish passive exposure from verified mastery. Starting a video logs progress, but only passing a verified domain assessment or completing an applied project generates an `AssessmentAttempt` with an empirical score. The adaptive engine weights this score to update the learner's `SkillState` and confidence value."

---

### Q7: How do you evaluate your recommendation engine?
> **Answer**:  
> "We evaluated the ranking engine across a benchmark dataset of 20 multi-gap career scenarios. Our hybrid algorithm achieved an average **Recall@5 of 82.50%** and an **NDCG@5 of 0.7806** (with top recommendations scoring **0.942**), proving strong ranking quality and relevance."

---

### Q8: How is multi-tenant learner isolation enforced?
> **Answer**:  
> "We do not rely on the LLM to enforce data privacy. Every database query in Prisma is hard-scoped with `where: { userId }`. If Learner A attempts to request Learner B's conversation ID or profile, the API returns a strict `404 Not Found` at the database layer before reaching any AI component."

---

### Q9: What happens if the external AI service or LLM provider goes down?
> **Answer**:  
> "The core product never collapses. All critical path generation, skill gap analysis, milestone progression, and hybrid recommendation ranking operate deterministically on our Node.js backend. If the external LLM is unreachable, the system gracefully falls back to rule-based profile forms and structured guidance summaries."

---

### Q10: How would you scale PathForge to 100,000 active learners?
> **Answer**:  
> "The architecture is stateless and horizontally scalable:  
> 1. Express API services deployed behind a load balancer.  
> 2. PostgreSQL with read replicas and indexed foreign keys.  
> 3. Redis for caching canonical career DAGs and resource metadata.  
> 4. Dedicated vector indexing (e.g. `pgvector` or Pinecone) for sub-millisecond semantic retrieval across millions of learning resources."
