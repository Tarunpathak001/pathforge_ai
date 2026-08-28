# PathForge AI — Unified Career Intelligence Dashboard (Phase 7)

## 1. Product Overview & Command Center Vision

The **PathForge AI Dashboard** (`/dashboard`) serves as the central command center for learners, synthesizing all multi-phase career intelligence into a single, cohesive interface.

Rather than forcing learners to navigate across multiple detached tools, the dashboard immediately answers the **5 Core Learner Questions within 10 seconds**:

```
1. WHERE AM I?            ──> Target Career & Career Alignment % (72%)
2. WHAT AM I MISSING?     ──> Top Strengths, Developing Skills & Priority Gaps
3. WHAT AM I LEARNING?    ──> Active Milestone & Progress (Milestone 2: 40%)
4. WHAT SHOULD I DO NEXT? ──> Spotlight Next Best Action (Resource / Quiz / Capstone)
5. WHY?                   ──> Deterministic Pedagogical Rationale linking prerequisites to career goals
```

---

## 2. Core Dashboard Features

### 2.1 Career Alignment Gauge
- Displays continuous career alignment percentage ($0\text{--}100\%$) derived from the mathematical skill gap model.
- Highlights verification gains ($\uparrow +8\%$ since last assessment).
- Provides instant counts of Strong, Developing, and Critical Gap skills.
- Explicit footnote clarifying that alignment represents modeled skill readiness rather than probabilistic job guarantees.

### 2.2 Spotlight Next Best Action Card
- Highest-priority spotlight positioned prominently at the top of the learning column.
- Automatically selects between:
  - `RESOURCE`: Start or continue primary learning resource.
  - `ASSESSMENT`: Take a verification quiz to unlock downstream milestones.
  - `PROJECT`: Complete a milestone capstone project.
- Explains the exact pedagogical reason why this action is recommended now.

### 2.3 Current Milestone in Focus
- Displays active milestone progression, study hours logged, and sequential skill checklist.
- Directly links to the full interactive learning path.

### 2.4 Skill Mastery Matrix & Improvement Tracker
- Grouped view of Strong, Developing, and Priority Gaps with confidence bars.
- Tracks verified level progressions (e.g. REST APIs: $1/5 \to 4/5$, $\uparrow +3$ levels).

### 2.5 Curated Recommendations & Activity Feed
- Previews top matched resources calculated by vector cosine similarity and multi-factor ranking.
- Chronological stream of learning activities (completed modules, quiz attempts, ratings).

---

## 3. Responsive UX & Error Resilience

- **Desktop (2-Column Grid)**: 65% learning & action flow on the left; 35% career alignment & telemetry on the right.
- **Mobile (Single Column Reflow)**: Smoothly collapses while preserving the critical information hierarchy.
- **Skeleton Shimmers**: Renders skeleton states on initial load without disruptive global screen spinners.
- **Career Switching & Stale Intelligence**: Allows learners to change target roles with 1-click automatic roadmap recalculation.
