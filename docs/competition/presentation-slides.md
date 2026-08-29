# PathForge AI — Competition Presentation Deck Specification

> **Event**: HCLTech Hackathon 2026  
> **Team**: PathForge Team (Team of 4)  
> **Tagline**: *From Career Goal to Adaptive Learning Path.*  
> **Total Slides**: 12 Slides (Designed for a 5–7 Minute Presentation)

---

## Slide 1 — Title & Vision

### Visual Layout
- Modern dark-gradient slide with PathForge AI compass logo.
- Clear tagline and competition subtitle.

### Slide Content
# PATHFORGE AI
### From Career Goal to Adaptive Learning Path
*An AI-powered adaptive career learning SaaS that turns career goals into evidence-driven, dynamic learning roadmaps.*

- **Team**: PathForge Team
- **Track**: AI/ML & EdTech SaaS Platform
- **Release Version**: `v1.0.0-final`

---

## Slide 2 — The Problem

### Visual Layout
- 4-quadrant friction diagram contrasting learner expectations with existing platform shortcomings.

### Slide Content
## The Problem in Modern Technical Learning

| Friction Area | Current Industry Reality | Learner Impact |
|---|---|---|
| **Content Overload** | 10,000+ unstructured courses dumped on learners | Decision paralysis & cognitive burnout |
| **Skill Blindspots** | Learners know their target role, but not their exact gaps | Wasting time on already-mastered concepts |
| **Static Roadmaps** | One-size-fits-all, un-sequenced course playlists | Prerequisite blockage & broken learning curves |
| **No Adaptation** | Path never updates when learner demonstrates mastery | Frustration from repeated, redundant materials |

---

## Slide 3 — Meet PathForge AI

### Visual Layout
- High-level system flow diagram showing the 6 core pillars.

### Slide Content
## The PathForge Solution: Closed-Loop Career Intelligence

```
Target Career Goal + Learner Profile
                 ↓
    [ 1. Skill Gap Engine ] ──── Prerequisite-Aware Severity Modeling
                 ↓
[ 2. Hybrid Recommendation Engine ] ──── 384-d Semantic Embeddings + Quality Matching
                 ↓
 [ 3. Topological Roadmap Planner ] ──── Milestone-Ordered Pedagogical Sequences
                 ↓
 [ 4. Verified Assessment & Evidence ] ──── Empirical Proof of Mastery
                 ↓
   [ 5. Closed-Loop Adaptive Engine ] ──── Dynamic Roadmap & Skill State Re-Sequencing
                 ↓
     [ 6. Grounded Career Copilot ] ──── 24/7 Zero-Hallucination AI Advisor
```

---

## Slide 4 — System Architecture

### Visual Layout
- Clean layered architecture diagram dividing Frontend, API Services, AI Engines, and Data Layer.

### Slide Content
## Technical Architecture & Engineering Rigor

```
[ Frontend: React 18 / TypeScript / Vite / Tailwind CSS ]
                         │  (Sub-200ms API Latency)
                         ▼
[ API Layer: Express / TypeScript / Zod Validation / Scoped Auth ]
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
[ Skill Graph ]    [ Hybrid Ranker ]   [ Adaptive Engine ]
(72 Skills / DAG)  (384-d Embeddings)  (Bayesian Updates)
     ▲                   ▲                   ▲
     └───────────────────┼───────────────────┘
                         ▼
[ Grounded Career Copilot (Intent Classifier + Zero-Hallucination Context) ]
                         │
                         ▼
[ Data Layer: PostgreSQL / SQLite + Prisma ORM + Redis Cache ]
```

---

## Slide 5 — The AI/ML Stack Behind PathForge

### Visual Layout
- 2-column split clearly separating **Deterministic Graph Intelligence** from **Probabilistic LLM & Embedding Intelligence**.

### Slide Content
## Multi-Tiered AI/ML Implementation

```
PROBABILISTIC / SEMANTIC AI                   DETERMINISTIC INTELLIGENCE
─────────────────────────────────────         ─────────────────────────────────────
1. NLP Profile Extraction                     1. Directed Acyclic Graph (DAG)
   • Unstructured resume parsing                 • 66 validated prerequisite edges
   • Keyword normalization & entity mapping      • Cycle-free topological sorting

2. 384-d Dense Vector Embeddings              2. Multi-Factor Hybrid Ranker
   • all-MiniLM-L6-v2 cosine similarity          • Coverage (35%) + Difficulty (20%)
   • Deep semantic resource matching             • Format (15%) + Quality (15%) + Embeddings (15%)

3. Grounded Conversational LLM                3. Bayesian Evidence Inference
   • Deterministic intent classifier (<50ms)     • Dynamic confidence scoring (1–5)
   • Scoped database context injection           • Automated gap resolution & unlocking
```

---

## Slide 6 — Personalized Skill Gap Intelligence

### Visual Layout
- Concrete learner example (Alex Chen, Backend Engineer) showing required vs. actual proficiency.

### Slide Content
## Prerequisite-Aware Skill Gap Intelligence

```text
TARGET CAREER: Senior Backend Engineer (Alignment: 72%)

SKILL                CURRENT    REQUIRED    GAP SEVERITY    PREREQUISITE STATUS
────────────────────────────────────────────────────────────────────────────────
Java                 Level 4    Level 4     0 (Satisfied)   ✅ All Prerequisites Met
SQL                  Level 3    Level 4     1 (Developing)  ✅ Ready to Advance
REST APIs            Level 4    Level 4     0 (Resolved)    ✅ Unlocks Spring Boot
Spring Boot          Level 2    Level 4     2 (Developing)  ✅ In Active Milestone
System Design        Level 0    Level 4     4 (Critical)    ⚠️ Blocked by Architecture
Distributed Systems  Level 0    Level 4     4 (Critical)    ⚠️ Blocked by System Design
```

> **Key Takeaway**: PathForge never tells a learner to study *System Design* first when core prerequisites are still missing.

---

## Slide 7 — Closed-Loop Adaptive Learning

### Visual Layout
- Before vs. After comparison demonstrating the live transformation.

### Slide Content
## Dynamic Adaptation: The Path Adapts When the Learner Changes

```
BEFORE ASSESSMENT                              AFTER VERIFIED 90% ASSESSMENT
─────────────────────────────────────          ─────────────────────────────────────
• REST APIs: Level 1/5                         • REST APIs: Level 4/5
• Status: Critical Skill Gap                   • Status: Satisfied (Confidence: 0.95)
• Career Alignment: 64%                        • Career Alignment: 72% (↑ +8%)
• Milestone 1: REST Fundamentals               • Milestone 1: COMPLETED
• Milestone 2: Spring Boot (Locked)            • Milestone 2: Spring Boot (ACTIVE)

                       ═════════════════════════════════════
                       "The learning path changes in real time
                        when the learner demonstrates mastery."
                       ═════════════════════════════════════
```

---

## Slide 8 — Grounded Career Copilot

### Visual Layout
- Clean chat screenshot demonstrating grounded responses, grounding source pills, and direct CTA buttons.

### Slide Content
## Grounded Career Copilot: Zero-Hallucination AI Guidance

```text
Learner: "Why did my roadmap change?"

Copilot: "Based on your verified 90% score on the REST API Assessment:
          1. Your REST API skill level was updated from 1 to 4/5.
          2. Milestone 1 (REST Fundamentals) was marked COMPLETED.
          3. Milestone 2 (Spring Boot Microservices) is now your active focus.
          Your alignment toward Backend Engineer increased from 64% to 72%."

          [ ✓ Grounded in: Assessment Evidence & Active Roadmap ]

          [ Start: Build a REST API with Spring Boot → ]  [ View Roadmap → ]
```

- **Security Guarantee**: Hard-scoped multi-tenant isolation + prompt injection immunity.

---

## Slide 9 — Command Center Dashboard

### Visual Layout
- Dashboard screenshot highlighting the 13 modular SaaS widgets.

### Slide Content
## Unified Command Center Experience

- **Executive Alignment Score**: Instant visual feedback on target career readiness (72%).
- **Your Next Best Action**: High-contrast, prominent recommendation card with estimated time budget (5.0 hrs) and pedagogical rationale.
- **Active Milestone Progress**: Visual step-by-step progress tracking with real-time percentage completion.
- **Topological Roadmap Timeline**: Expandable multi-milestone roadmap with resource links and quiz triggers.
- **Instant Career Switching**: One-click target career reconfiguration with dynamic gap recalculation.

---

## Slide 10 — Engineering Excellence & Reliability

### Visual Layout
- Monorepo structure, code metrics, and automated test coverage badges.

### Slide Content
## Engineering Rigor & Production Architecture

- **Clean Monorepo**: `@pathforge/shared`, `@pathforge/api`, `@pathforge/web` with pnpm workspaces.
- **100% Automated Test Coverage**:
  - **127 / 127 automated tests passing** across 24 test suites.
  - End-to-End Golden User Journey test covering all 10 workflow steps.
- **Sub-200ms Latency**: Dashboard aggregator endpoint executes in **175ms**.
- **Production Probes**: Built-in `/health` and `/health/ready` liveness and readiness monitoring.
- **Type Safety**: End-to-end schema validation via Zod; zero client-server schema drift.

---

## Slide 11 — Empirical Evaluation & Benchmark Results

### Visual Layout
- Key benchmark scorecards and latency metrics.

### Slide Content
## Empirical Benchmark Evaluation Results

```
METRIC                       MEASURED VALUE    BENCHMARK TARGET    EVALUATION DATASET
───────────────────────────────────────────────────────────────────────────────────────
Recommendation Precision@5   37.00%            > 30.00%            20 Multi-Gap Scenarios
Recommendation Recall@5      82.50%            > 75.00%            20 Multi-Gap Scenarios
Recommendation NDCG@5        0.7806 (Top: 0.942)> 0.7500           20 Multi-Gap Scenarios
Copilot Grounding Accuracy   100.0%            100.0%              35+ Ground Truth Prompts
Copilot Hallucination Rate   0.0%              0.0%                7 Adversarial Edge Cases
Dashboard API Latency        175ms             < 500ms             Local / Demo Workload
```

---

## Slide 12 — Why PathForge AI?

### Visual Layout
- Powerful closing comparison summarizing the core value proposition.

### Slide Content
## Why PathForge AI Wins

```
TRADITIONAL PLATFORMS                         PATHFORGE AI
─────────────────────────────────────         ─────────────────────────────────────
"Here are 1,000 generic courses."             "Here is your exact career goal."
"Good luck finding your skill gaps."          "Here is what you know vs. what you need."
"Start wherever you want."                    "Here is the exact prerequisite order."
"Your playlist never changes."                "Your roadmap adapts as you prove mastery."
"Chatbot gives generic advice."               "Copilot is grounded in your real database."

                       ═════════════════════════════════════
                       PathForge turns career planning from
                       a static course search into an
                       adaptive, evidence-driven journey.
                       ═════════════════════════════════════
```

**Thank you!**  
*Explore the live demo & repository: [https://github.com/Tarunpathak001/pathforge_ai](https://github.com/Tarunpathak001/pathforge_ai)*
