# Personalized Learning Path & Roadmap Generator

## Overview

The **Personalized Learning Path & Roadmap Generator** transforms a learner's starting profile, target career goal, skill gap analysis, prerequisite knowledge graph, and curated educational resources into a **structured, chronological, explainable learning roadmap**.

Unlike generic static curriculums, PathForge AI dynamically determines:
1. **What to learn**: Identifies genuine gaps and excludes already mastered skills.
2. **What order to learn in**: Respects strict prerequisite constraints via topological sequencing.
3. **What resources to use**: Recommends complementary Primary, Supporting, and Practical learning materials for each milestone.
4. **How long it will take**: Schedules realistic weekly workloads ($T_{\text{weeks}} = \lceil H_{\text{total}} / H_{\text{weekly}} \rceil$) tailored to the learner's personal availability.
5. **Why this order was chosen**: Provides transparent, prerequisite-grounded rationale for every step.

---

## Core Product Journey

```
+-----------------------------------------------------------------------------------+
| 1. Learner Profile & Goals                                                        |
|    - Verified Skills & Self-Reported Levels                                       |
|    - Weekly Commitment Availability (e.g. 10 hrs/week)                            |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. Skill Gap Intelligence (Phase 3)                                               |
|    - Critical, Developing, and Missing Skill Gaps                                 |
|    - Career Importance & Prerequisite Impact Scores                              |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. Prerequisite Graph Traversal (Phase 2 & 5)                                     |
|    - Prerequisite Closure (unmet foundational requirements added upstream)        |
|    - Multi-tier Topological Ordering (Kahn's algorithm)                           |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. Thematic Milestone Clustering & Resource Assignment (Phase 4 & 5)              |
|    - Grouping into 3–6 logical milestones (Foundations -> Architecture -> Capstone)|
|    - 2–4 measurable learning objectives & verifiable completion criteria          |
|    - Curated Primary, Supporting, and Project resources assigned                  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 5. Interactive Roadmap UI (/learning-path)                                        |
|    - Step-by-step visual timeline                                                 |
|    - "Why this order?" explanations                                               |
|    - Deep-dive milestone inspection modal                                         |
+-----------------------------------------------------------------------------------+
```

---

## Key Milestone Attributes

Each roadmap milestone is an actionable, inspectable unit containing:
- **Order & Title**: Chronological sequence number and descriptive title (e.g., *Milestone 1: REST API Foundations*).
- **Duration & Hours**: Calculated study time and estimated weeks based on the learner's weekly availability.
- **Target Competencies**: Target proficiency level (1–5) for each covered skill.
- **Learning Objectives**: 2–4 measurable, behavioral learning outcomes.
- **Curated Resources**: Top-ranked learning materials categorized by role (Primary Course/Docs, Supporting Guide, Practical Project).
- **Completion Criteria**: Concrete deliverable or implementation standard required before moving forward.
- **Prerequisite Rationale**: Plain-text explanation of why this milestone is positioned here.

---

## Roadmap Regeneration & Archival

- When a learner updates their profile or requests a fresh plan, the system generates a new `ACTIVE` roadmap version (`path-v1`).
- All previous roadmaps for that career are cleanly archived with status `ARCHIVED` to maintain a historical record of learning progression.
