# Architecture Specification: Skill Gap Intelligence Engine

## Overview

The **Skill Gap Intelligence Engine** executes server-side, in-memory graph traversals and mathematical vector evaluations to compare a `LearnerProfile` with a `Career` skill dependency graph.

---

## 1. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   LEARNER PROFILE                      │
│   • LearnerSkill[] (selfReportedLevel, evidence)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SKILL MATCHER                        │
│   1. Canonical ID lookup                               │
│   2. Normalized alias mapping (e.g. Node -> Node.js)   │
│   3. Exact string & slug match                         │
│   4. False-positive prevention (Java != JavaScript)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            PREREQUISITE DAG GRAPH ENGINE               │
│   • Direct & transitive dependency resolution          │
│   • Downstream influence calculation                   │
│   • Readiness state evaluation (READY/PARTIAL/BLOCKED) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             DETERMINISTIC SCORING ENGINE               │
│   • Gap severity calculation: rawGap / requiredLevel   │
│   • Career importance weighting (CORE=1.0, HIGH=0.8)   │
│   • Multi-factor priority score calculation            │
│   • Career alignment percentage (0–100%)               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              PERSISTENCE & API LAYER                   │
│   • SkillGapAnalysis + SkillGapResult models           │
│   • Fast indexed retrieval by userId & careerSlug      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema (`Prisma`)

### `SkillGapAnalysis`

- `id`: UUID (Primary Key)
- `userId`: String (Foreign key to User, indexed)
- `learnerProfileId`: String (Foreign key to LearnerProfile, indexed)
- `careerId`: String (Foreign key to Career, indexed)
- `readinessScore`: Float (0.0 to 100.0)
- `readinessBand`: String
- `algorithmVersion`: String (`v1`)
- `summary`: String (Text overview)
- `stats`: String (JSON metadata counts)
- `createdAt`, `updatedAt`: DateTime

### `SkillGapResult`

- `id`: UUID (Primary Key)
- `analysisId`: String (Foreign key to SkillGapAnalysis, indexed)
- `skillId`: String (Foreign key to Skill, indexed)
- `learnerLevel`: Int (0 to 5)
- `requiredLevel`: Int (1 to 5)
- `gap`: Int ($\max(0, \text{Required} - \text{Learner})$)
- `gapSeverity`: Float (0.0 to 1.0)
- `importance`: String (`CORE`, `HIGH`, `MEDIUM`, `OPTIONAL`)
- `priorityScore`: Float (0.0 to 1.0)
- `readiness`: String (`READY`, `PARTIALLY_READY`, `BLOCKED`)
- `category`: String (`STRENGTH`, `DEVELOPING`, `MISSING`)
- `isCritical`: Boolean
- `explanation`: String
- `downstreamImpactCount`: Int

---

## 3. Query Optimization & Performance

- **Zero N+1 Queries**: Career requirements, skill models, and prerequisite DAG edges are fetched in single batch queries and indexed in memory via hash maps.
- **In-Memory Traversal**: Downstream dependency graph influence is computed in $O(V + E)$ time using BFS traversal.
- **Sub-100ms Execution**: Analysis generation and persistence complete in under 50ms locally on SQLite/PostgreSQL.
