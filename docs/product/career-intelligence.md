# Career & Skill Intelligence Knowledge Base

## 1. Overview & Purpose

PathForge AI operates on a dual-sided intelligence model:

1. **Learner Side (Phase 1):** What does the learner know? (Learner Profile)
2. **Career Side (Phase 2):** What does the target career require? (Career Skill Knowledge Base)

Phase 2 establishes the curated knowledge base that answers:

> _"What skills does a person need for a specific career, how important is each skill, what level of competency is expected, and what prerequisite relationships exist between those skills?"_

```text
LEARNER SIDE (Phase 1)                CAREER SIDE (Phase 2)
What does the learner know?            What does the career require?
        ↓                                      ↓
  Learner Profile                    Career Skill Knowledge Base
  - Self-reported skill levels (1-5)  - Required proficiency benchmarks (1-5)
  - Projects & Evidence               - Importance tiers (CORE, HIGH, MEDIUM, OPTIONAL)
  - Learning preferences              - Prerequisite dependency DAG
        │                                      │
        └──────────────────┬───────────────────┘
                           ↓
               Phase 3: Skill Gap Engine
```

---

## 2. Core Concepts & Taxonomy

### 2.1 Skill Importance Tiers

Every skill required by a career is categorized into one of four importance tiers:

| Tier         | Meaning                                                            | Impact on Career Readiness                        |
| :----------- | :----------------------------------------------------------------- | :------------------------------------------------ |
| **CORE**     | Essential foundation for the career role. Non-negotiable baseline. | A gap in a CORE skill blocks career transition.   |
| **HIGH**     | Strongly expected across industry job openings.                    | Strongly prioritized in learning path generation. |
| **MEDIUM**   | Useful domain extension; not universally mandatory.                | Differentiating skill for competitive candidates. |
| **OPTIONAL** | Valuable specialization or nice-to-have tool.                      | Suggested for advanced or niche project paths.    |

### 2.2 Required Competency Levels (1–5 Scale)

The required skill level represents the **expected competency benchmark for the target career**, distinct from the learner's self-reported proficiency:

- **Level 1 — Beginner:** Conceptual awareness, basic syntax, and standard terminology.
- **Level 2 — Basic:** Able to perform routine, guided tasks with documentation.
- **Level 3 — Intermediate:** Autonomous feature implementation, standard idioms, and debugging.
- **Level 4 — Advanced:** In-depth architectural decisions, performance optimization, and edge-case handling.
- **Level 5 — Expert:** System-level mastery, distributed consistency, and technical leadership.

> [!IMPORTANT]
> **Critical Architectural Distinction:**
>
> - `LearnerSkill.selfReportedLevel` = Learner's current mastery level (1–5)
> - `CareerSkill.requiredLevel` = Career role's required benchmark (1–5)
>
> In Phase 3, `SkillGap = max(0, CareerSkill.requiredLevel - LearnerSkill.selfReportedLevel)`.

---

## 3. Seeded Career Catalog (15 Industry Roles)

The initial curated knowledge base includes 15 distinct roles:

1. **Backend Engineer (`backend-engineer`)**: Server-side APIs, database modeling, authentication, and distributed architecture.
2. **Frontend Engineer (`frontend-engineer`)**: Responsive web apps, React/TypeScript, Core Web Vitals, and state management.
3. **Full Stack Engineer (`full-stack-engineer`)**: End-to-end web capabilities across React, Node.js, and relational databases.
4. **Software Engineer (`software-engineer`)**: Core data structures, algorithms, object-oriented design, and testing.
5. **DevOps Engineer (`devops-engineer`)**: Linux administration, Docker, Kubernetes, CI/CD pipelines, and Terraform.
6. **Cloud Engineer (`cloud-engineer`)**: Cloud architecture fundamentals, AWS infrastructure, and networking.
7. **Data Engineer (`data-engineer`)**: Advanced SQL, Python ETL pipelines, data warehousing, and Apache Spark.
8. **Data Scientist (`data-scientist`)**: Statistics, probability, exploratory analysis with Pandas, and machine learning.
9. **Machine Learning Engineer (`machine-learning-engineer`)**: PyTorch deep learning, neural networks, and MLOps deployment.
10. **AI Engineer (`ai-engineer`)**: Large language models (LLMs), prompt engineering, vector databases, and RAG pipelines.
11. **Cybersecurity Analyst (`cybersecurity-analyst`)**: Network defense, OWASP Web Security, cryptography, and SIEM monitoring.
12. **Mobile Application Developer (`mobile-app-developer`)**: React Native cross-platform apps, mobile architecture, and offline sync.
13. **QA & Automation Engineer (`qa-automation-engineer`)**: Automated E2E testing (Playwright/Cypress), integration testing, and CI gates.
14. **Data Analyst (`data-analyst`)**: SQL querying, data visualization (Tableau/Power BI), and statistical metrics.
15. **Product Analyst (`product-analyst`)**: Product telemetry, funnel conversion, user retention, and A/B test design.

---

## 4. Skill Prerequisite DAG

Skills are connected in a **Directed Acyclic Graph (DAG)** where directed edges specify prerequisite relationships (`skillId -> prerequisiteSkillId`).

Example Progression Chains:

```text
Networking Basics ──► HTTP & Web Fundamentals ──► REST APIs ──► API Design ──► Microservices Architecture ──► System Design

Programming Fundamentals ──► Java ──► Spring Boot ──► Microservices

Programming Fundamentals ──► JavaScript ──► TypeScript ──► React ──► Next.js

Statistics & Probability + Python ──► Machine Learning ──► Deep Learning ──► Transformers & LLMs ──► Prompt Engineering ──► Vector Databases (RAG)
```

Prerequisite relationships define **strength** (`REQUIRED`, `RECOMMENDED`, `HELPFUL`) and include educational **rationales** to empower the explainability engine.
