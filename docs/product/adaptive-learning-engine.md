# PathForge AI — Adaptive Career Learning & Skill Intelligence (Phase 6)

## 1. Executive Summary

Phase 6 elevates PathForge AI from a static roadmap generator into a **closed-loop adaptive career-learning platform**.

Traditional learning platforms follow an open-loop model: they provide a static syllabus that never adapts based on what the learner actually understands or struggles with. PathForge AI solves this by closing the feedback loop:

```
[Learner Baseline] ──> [Skill Gap Analysis] ──> [Personalized Learning Path]
        ▲                                                      │
        │                                                      ▼
[Authoritative Skill State] <── [Assessments / Practice] <── [Study Resources]
        │
        ▼
[Deterministic Path Adaptation & Next Best Action]
```

---

## 2. Core Value Propositions

### 2.1 Separation of Self-Report vs. Measured Evidence
- **Preserved Self-Report (`LearnerSkill`)**: The learner's original onboarding profile is never overwritten or destroyed.
- **Verifiable Evidence (`SkillEvidence`)**: Granular records of assessments, project submissions, and resource completions.
- **Authoritative Inferred State (`SkillState`)**: A synthesized competency rating ($1\text{--}5$) paired with an evidence confidence score ($0.0\text{--}1.0$).

### 2.2 Server-Side Deterministic Scoring & Anti-Cheating
- All assessment scoring happens strictly on the server:
  $$\text{Score} = \frac{\text{Correct Answers}}{\text{Total Questions}} \times 100$$
- Correct options and explanations are withheld during test taking and only revealed in the post-test mastery breakdown.

### 2.3 Transparent Closed-Loop Adaptation
When a learner finishes an assessment or study milestone:
1. **Skill Evidence Logging**: Measured score and high confidence ($0.85\text{--}0.90$) are recorded.
2. **Authoritative State Updates**: The skill's inferred level shifts (e.g. REST APIs from $1/5 \to 4/5$).
3. **Gap Resolution**: Gaps are re-evaluated against the target career. Satisfied skills are removed from critical blockers.
4. **Prerequisite & Milestone Unlocking**: Downstream milestones (e.g. Backend Architecture) transition from locked to unlocked.
5. **Next Best Action Spotlight**: The system highlights the single highest-impact next step.

---

## 3. Learner Experience & Interaction Flow

1. **Dashboard Overview (`/progress`)**:
   - Live career alignment progress indicator showing historical gains ($+\Delta\%$).
   - Roadmap completion meters weighted by estimated study hours.
   - Skill Mastery Matrix comparing self-reported level vs. inferred competency with confidence bars.
2. **Next Best Action Card**:
   - Identifies whether the learner should start a primary resource, take a verification quiz, or deliver a capstone project.
3. **Assessment Center (`/assessments`)**:
   - 6 curated assessments covering core backend skills (REST APIs, Spring Boot, SQL, Redis, Docker, System Design).
   - Instant score calculation, strong topic highlights, and remediation topics.
4. **1-Click Feedback Modal**:
   - Collects actionable ratings (*Too Easy*, *Just Right*, *Too Difficult*, *Not Relevant*) to tune recommendation rankings.
