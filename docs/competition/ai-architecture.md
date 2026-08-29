# PathForge AI — Comprehensive AI/ML Architecture & Pipeline

## 1. High-Level AI Pipeline

```
[ Unstructured Learner Text ] ──> [ 1. NLP Profile Extraction ] ──> [ Structured Learner Profile ]
                                                                             │
                                                                             ▼
                                                                [ 2. Career Skill Graph (DAG) ]
                                                                             │
                                                                             ▼
                                                                 [ 3. Skill Gap Engine ]
                                                                             │
                                                                             ▼
[ 50+ Curated Resources ] ──> [ 4. 384-d Vector Embeddings ] ──> [ 5. Semantic Vector Retrieval ]
                                                                             │
                                                                             ▼
                                                                [ 6. Hybrid Ranking Engine ]
                                                                (Skill Fit + Difficulty + Format + Quality + Vector Sim)
                                                                             │
                                                                             ▼
                                                                [ 7. Personalized Roadmap Planner ]
                                                                             │
                                                                             ▼
[ Verified Assessment Attempt ] ──> [ 8. Adaptive Evidence Engine ] ──> [ Dynamic Path Recalculation ]
                                                                             │
                                                                             ▼
                                                                [ 9. Grounded Career Copilot ]
                                                                (Zero Hallucinations + Scoped Context)
```

---

## 2. Component-by-Component Technical Breakdown

### Component 1: Natural Language Profile Extraction
- **Input**: Freeform text (e.g. resume snippet, LinkedIn bio, self-description).
- **Processing**: Structured JSON extraction via LLM with deterministic regex fallback for skill normalization.
- **Output**: Typed `CreateLearnerProfileSchema` object.
- **Why Used**: Reduces onboarding friction from 15 minutes of manual forms to 30 seconds.
- **Fallback**: Rule-based skill keyword tokenizer and standard onboarding wizard forms.

### Component 2: Semantic Vector Embeddings
- **Model**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
- **Processing**: Embeds resource descriptions and titles into normalized float arrays stored in the database.
- **Output**: Precomputed vector embeddings attached to canonical educational resources.
- **Why Used**: Captures latent semantic relationships that keyword matching misses.
- **Fallback**: Token-level Jaccard similarity and category keyword overlap.

### Component 3: Hybrid Recommendation Ranking Formula
- **Input**: Learner Profile + Identified Skill Gap + Candidate Resources.
- **Scoring Function**:
  $$\text{FinalScore} = w_{\text{skill}} \cdot S_{\text{coverage}} + w_{\text{diff}} \cdot S_{\text{difficulty}} + w_{\text{fmt}} \cdot S_{\text{format}} + w_{\text{qual}} \cdot S_{\text{quality}} + w_{\text{sem}} \cdot S_{\text{semantic}}$$
- **Default Weights**: $w_{\text{skill}} = 0.35$, $w_{\text{diff}} = 0.20$, $w_{\text{fmt}} = 0.15$, $w_{\text{qual}} = 0.15$, $w_{\text{sem}} = 0.15$.
- **Why Used**: Pure semantic search ignores prerequisite readiness and format preference; pure filtering ignores pedagogical quality. Hybrid ranking delivers both relevance and personalization.

### Component 4: Adaptive Evidence & Skill Inference Engine
- **Input**: Assessment scores, resource completions, logged study hours.
- **Processing**: Bayesian evidence weighting:
  $$\text{InferredLevel} = \min\left(5, \text{Round}\left(\text{BaseLevel} + \Delta_{\text{assessment}} \cdot \text{Weight}_{\text{assessment}} + \Delta_{\text{practice}} \cdot \text{Weight}_{\text{practice}}\right)\right)$$
- **Output**: Updated `SkillState` with inferred level and verified confidence score.
- **Why Used**: Replaces self-reported guesswork with verifiable learning proof.

### Component 5: Grounded LLM Career Copilot
- **Input**: Authenticated learner query + scoped context snapshot (gaps, active roadmap, next action).
- **Processing**: Fast deterministic intent classifier (<50ms) + context-bounded structured prompt.
- **Output**: Typed `CopilotStructuredResponse` with answer, grounding badges, and clickable CTA chips.
- **Why Used**: Provides conversational guidance without risking hallucinations.
- **Defense Mechanism**: Hard refusal on prompt injection, cross-learner data leakage, or fake claim validation.
