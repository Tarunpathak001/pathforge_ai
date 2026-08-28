# Architecture Specification — Closed-Loop Adaptive Engine (Phase 6)

## 1. Data Model Architecture

```prisma
model ResourceProgress {
  id                 String           @id @default(uuid())
  learnerProfileId   String
  resourceId         String
  status             String           // NOT_STARTED, IN_PROGRESS, COMPLETED, SKIPPED
  progressPercent    Float            // 0.0 to 100.0
  startedAt          DateTime?
  completedAt        DateTime?
  timeSpentMinutes   Float
  lastAccessedAt     DateTime
}

model SkillEvidence {
  id               String         @id @default(uuid())
  learnerProfileId String
  skillId          String
  evidenceType     String         // SELF_REPORTED, RESOURCE_COMPLETION, ASSESSMENT, PROJECT, USER_FEEDBACK
  sourceId         String?
  score            Float          // 0.0 to 100.0
  confidence       Float          // 0.0 to 1.0
  notes            String?
  createdAt        DateTime
}

model SkillState {
  id               String         @id @default(uuid())
  learnerProfileId String
  skillId          String
  inferredLevel    Int            // 1 to 5
  confidence       Float          // 0.0 to 1.0
  evidenceScore    Float          // 0.0 to 100.0
  status           String         // NEEDS_WORK, DEVELOPING, SATISFIED, MASTERED
  lastAssessedAt   DateTime?
}

model Assessment {
  id               String               @id @default(uuid())
  title            String
  slug             String               @unique
  difficulty       String               // BEGINNER, INTERMEDIATE, ADVANCED
  estimatedMinutes Int
  passingScore     Int
  questions        AssessmentQuestion[]
  attempts         AssessmentAttempt[]
}
```

---

## 2. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/progress/resources/:id/start` | Starts tracking resource progress (`IN_PROGRESS`). |
| `PATCH` | `/api/progress/resources/:id` | Incremental progress update ($0\text{--}100\%$). |
| `POST` | `/api/progress/resources/:id/complete` | Marks resource $100\%$ completed and generates `SkillEvidence`. |
| `POST` | `/api/progress/resources/:id/skip` | Marks resource `SKIPPED`. |
| `GET` | `/api/progress/summary` | Full weighted path and milestone progress report. |
| `GET` | `/api/assessments` | Active assessment catalog with skill tags. |
| `GET` | `/api/assessments/:id` | Sanitized question payload (answers withheld). |
| `POST` | `/api/assessments/:id/attempt` | Evaluates submitted answers on server and updates `SkillState`. |
| `POST` | `/api/feedback` | Ingests learner feedback on resources/milestones. |
| `POST` | `/api/adaptive/recalculate` | Triggers closed-loop recalculation and roadmap adaptation. |
| `GET` | `/api/adaptive/next-action` | Retrieves current Next Best Action. |
| `GET` | `/api/adaptive/skill-states` | Authoritative skill states and confidence matrix. |

---

## 3. Reliability & Performance Guarantees

- **Transactional Consistency**: All attempts and grading evaluations run within Prisma transactions.
- **Sub-Second Execution**:
  - Progress updates: $< 50\text{ms}$
  - Assessment grading: $< 100\text{ms}$
  - Adaptive roadmap recalculation: $< 400\text{ms}$
