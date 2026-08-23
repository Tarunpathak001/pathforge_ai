# PathForge AI — Intelligent Learning Resource Recommendation Engine

## Executive Summary
Phase 4 of **PathForge AI** closes the loop between personalized skill gap discovery and concrete, actionable skill acquisition. While Phase 3 answers *"What does this learner need to improve?"*, Phase 4 answers:

> **"What is the best, highest-quality resource for this learner to master that specific skill, given their current foundation, target role, and preferred learning format — and why was it chosen?"**

---

## 1. Product Capabilities

### 1.1 Multi-Factor Deterministic Match Scoring
PathForge computes a unified match percentage for candidate resources using seven calibrated dimensions:
1. **Semantic Text Relevance ($30\%$)**: 64-dimensional dense semantic embedding cosine similarity between the resource description/metadata and the learner's career/gap query context.
2. **Skill Coverage Depth ($25\%$)**: Differentiates resources teaching the skill as a `PRIMARY` topic vs `SUPPORTING` or `MENTIONED`.
3. **Target Career Importance ($15\%$)**: Prioritizes resources supporting `CORE` and `HIGH` importance skills in the chosen target role.
4. **Difficulty Zone Calibration ($10\%$)**: Selects materials aligned with the learner's current mastery level, avoiding resources that are too elementary or overwhelmingly advanced.
5. **Prerequisite Readiness Verification ($8\%$)**: Enforces foundational dependencies, penalizing advanced resources if prerequisites are unsatisfied.
6. **Learning Preference Fit ($7\%$)**: Aligns with preferred formats (Hands-on Projects, Documentation, Video, Books, Interactive Exercises) and weekly study bandwidth.
7. **Curated Technical Quality ($5\%$)**: Internal curated rating based on pedagogical clarity, freshness, and accuracy.

---

### 1.2 Diversity-Aware Re-Ranking
To avoid recommending repetitive formats (e.g. four consecutive video courses), PathForge applies an intra-gap diversity filter ensuring candidates span multiple modalities:
- **Courses & Interactive Tutorials**
- **Guided Hands-on Projects**
- **Official Technical Documentation**
- **In-depth Books & Guides**
- **Coding Exercises & Sandboxes**

---

### 1.3 Full Explainability
Every recommendation is accompanied by transparent, human-readable reasons explaining:
- Why the difficulty level is calibrated for the learner.
- Whether foundational prerequisites were confirmed.
- How the resource directly targets the career's core competency requirements.
- Match percentage and score breakdown per factor.

---

## 2. API Surface Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/recommendations/generate` | `POST` | Computes & persists fresh recommendations for learner profile and target career. |
| `/api/recommendations` | `GET` | Retrieves latest saved recommendation groups for the active user. |
| `/api/recommendations/:id` | `GET` | Retrieves detailed subscore breakdown and explanation for a single recommendation. |
| `/api/recommendations/skill/:skillId` | `GET` | Retrieves recommendations filtered to a specific target skill. |

---

## 3. UI Features
- **Grouped by Skill Gap**: Recommendations are segmented by priority skill gaps (Critical Gaps, Developing Skills).
- **Match Score Pills**: Color-coded match percentage badge (Emerald $\ge 80\%$, Indigo $65-79\%$, Amber $<65\%$).
- **Multi-Filter Bar**: Filter by Resource Type (Course, Project, Docs, Video, Book, Exercise), Difficulty, and Free-only.
- **Score Breakdown Modal**: Visual progress bars displaying each of the 7 component subscores.
