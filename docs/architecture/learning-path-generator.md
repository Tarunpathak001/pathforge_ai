# Learning Path Generator Architecture

## 1. System Components

The Learning Path Generation subsystem bridges the Gap Analysis Engine, Career DAG Knowledge Base, Recommendation Engine, and SQLite Database.

```
                              [ Client / Web Browser ]
                                         │
                                         ▼ (REST /api/learning-path/*)
                            ┌─────────────────────────┐
                            │   LearningPathRoutes    │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │   LearningPathService   │
                            └────────────┬────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            ▼                            ▼                            ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  SkillGapAnalysis      │  │  Prerequisite Graph    │  │  Curated Resources     │
│  (Phase 3 Gap Data)    │  │  (Phase 2 DAG Edges)   │  │  (Phase 4 Repositories)│
└───────────┬────────────┘  └────────────┬───────────┘  └────────────┬───────────┘
            └────────────────────────────┼───────────────────────────┘
                                         ▼
                            ┌─────────────────────────┐
                            │  generateLearningPath   │
                            │   (@pathforge/shared)   │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │  validateLearningPath   │
                            │   (@pathforge/shared)   │
                            └────────────┬────────────┘
                                         │ (Transaction)
                                         ▼
                            ┌─────────────────────────┐
                            │     Prisma / SQLite     │
                            │   LearningPath / Steps  │
                            └─────────────────────────┘
```

---

## 2. Database Schema Design

### `LearningPath`
Represents an instantiated roadmap report for a learner targeting a specific career:
- `id`: UUID Primary Key
- `userId`: Target user ID
- `learnerProfileId`: Foreign key to `LearnerProfile`
- `careerId`: Foreign key to `Career`
- `title`, `description`: Human-readable summary
- `readinessAtGeneration`: Snapshot of learner readiness score (0–100%)
- `estimatedHours`: Total hours across all milestones
- `estimatedWeeks`: Calculated duration at current weekly commitment
- `weeklyHours`: Weekly study commitment (e.g. 10.0 hrs/week)
- `status`: Enum string (`ACTIVE`, `ARCHIVED`, `COMPLETED`)
- `algorithmVersion`: Algorithm version identifier (`path-v1`)
- `whyThisOrderOverview`: JSON serialized overview narrative

### `LearningMilestone`
Represents a thematic milestone in the learning sequence:
- `id`: UUID Primary Key
- `learningPathId`: Foreign key to `LearningPath`
- `title`, `description`: Milestone name and focus
- `order`: 1-based chronological index (1, 2, 3...)
- `estimatedHours`: Milestone study effort
- `estimatedWeeks`: Milestone calendar weeks
- `learningObjectives`: JSON array of measurable outcomes
- `completionCriteria`: JSON array of verifiable criteria
- `whyThisOrder`: Factual explanation of positioning
- `status`: Enum string (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)

### `MilestoneSkill` & `MilestoneResource`
Join tables linking milestones to specific skills (with target proficiency level) and curated learning resources (with role: `PRIMARY`, `SUPPORTING`, `PRACTICE`, `PROJECT`).

---

## 3. Transactional Consistency & Archiving

Roadmap generation executes inside an atomic Prisma transaction (`prisma.$transaction`):
1. All existing `ACTIVE` roadmaps for the user and target career are updated to `ARCHIVED`.
2. The new `LearningPath` header record is inserted with `status: 'ACTIVE'`.
3. All `LearningMilestone`, `MilestoneSkill`, and `MilestoneResource` child records are created.
4. Any generation or validation error triggers an immediate database rollback.
