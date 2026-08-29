# PathForge AI — 3–5 Minute Competition Demo Script

## Demo Setup Checklist
1. Start API Server: `pnpm --filter @pathforge/api dev` (Runs on `http://localhost:3001`)
2. Start Web Client: `pnpm --filter @pathforge/web dev` (Runs on `http://localhost:5173`)
3. Reset/Seed Canonical Demo State: `pnpm --filter @pathforge/api prisma db seed`
4. Browser Target: Open `http://localhost:5173/#/dashboard`

---

## Live Demo Flow (3–5 Minutes)

### 0:00 – 0:35 — Problem Context & Landing Page
- **Action**: Show Platform Landing Page (`#/dashboard`).
- **Speaking Track**:
  > *"Every learner knows where they want to go — becoming a Senior Backend Engineer or Cloud Architect. But existing platforms just dump 1,000 generic courses on them. They don't know what skills they're actually missing, what order to learn them in, or what to do next. PathForge AI solves this by transforming static career targets into dynamic, evidence-driven learning roadmaps."*

### 0:35 – 1:15 — The Command Center Dashboard
- **Action**: Highlight the Dashboard Widgets.
  - **Career Alignment Card**: *72% Alignment to Backend Engineer*.
  - **Critical Skill Gaps**: *System Design (Level 1/5), Distributed Systems (Level 0/5)*.
  - **Active Milestone**: *Milestone 2 — Spring Boot & Advanced Microservices*.
  - **Next Best Action**: *Build a REST API with Spring Boot (5.0 hrs)*.
- **Speaking Track**:
  > *"Here is Alex Chen's unified career dashboard. PathForge has modeled 15 industry careers and 72 skills into a directed acyclic graph. Alex is at 72% alignment for Backend Engineer, with clear priority gaps identified."*

### 1:15 – 1:55 — Skill Gap Engine & Explainable Recommendations
- **Action**: Navigate to **Skill Gaps** (`#/gap`) $\to$ click **Resources** (`#/recommendations`).
- **Speaking Track**:
  > *"Our Skill Gap Engine doesn't just calculate differences; it evaluates prerequisite blocking. System Design is blocked until Microservices and Databases are solid. For each gap, our hybrid recommendation engine combines 384-dimensional semantic embeddings with difficulty and format preferences to recommend high-impact resources with full explainability."*

### 1:55 – 2:40 — Assessment & Closed-Loop Adaptive Learning
- **Action**: Navigate to **Roadmap** (`#/learning-path`) $\to$ click **Assessments** (`#/assessments`) $\to$ complete a REST API quiz with 100% score $\to$ click **Recalculate Adaptive Path**.
- **Speaking Track**:
  > *"This is where PathForge truly innovates. Watch as Alex completes a verified assessment on REST APIs. The adaptive engine immediately records the evidence, updates skill confidence from 1 to 4, resolves the critical gap, and dynamically re-sequences downstream milestones without requiring manual intervention."*

### 2:40 – 3:30 — Grounded Career Copilot
- **Action**: Click **Ask Copilot** in the header (`#/copilot`).
- **Interaction 1**: Click starter chip: *"Why is System Design still a gap for me?"*
  - Point out the grounding badge: `✓ Authoritative Skill Gap Engine` and prerequisite DAG reasoning.
- **Interaction 2**: Type: *"I only have 5 hours this week. What should I focus on?"*
  - Show how Copilot allocates tasks strictly within the 5.0-hour budget.
- **Interaction 3**: Click the suggested CTA chip: `[ Open Learning Roadmap → ]` to seamlessly transition back to the Roadmap.
- **Speaking Track**:
  > *"PathForge Copilot is NOT a generic hallucinating chatbot. It is deterministic and grounded strictly in the learner's database state. It cannot invent fake completions or hallucinate skill levels. Every response is provenanced with real grounding badges and direct action triggers."*

### 3:30 – 4:00 — Conclusion & Value Proposition
- **Speaking Track**:
  > *"PathForge AI bridges the gap from where a learner is to where they want to be — combining career intelligence, personalized roadmaps, verified assessment evidence, and grounded AI assistance in one complete SaaS platform. Thank you!"*
