# PathForge AI — Career Copilot & Grounded Conversational Intelligence (Phase 8)

## 1. Overview

The **PathForge AI Career Copilot** is a specialized, hallucination-free conversational assistant that acts as a 24/7 personal career mentor and learning advisor.

Unlike generic LLM chatbots that make up facts or pretend to know user details, the PathForge Career Copilot is **strictly grounded in the learner's actual database state**:
- Authoritative skill levels & confidence scores
- Modeled career requirements & importance ratings
- Multi-factor skill gap severities
- Prerequisite directed acyclic graph (DAG) dependencies
- Personalized recommendation match scores
- Active learning roadmap milestones & progression
- Real assessment attempt history

---

## 2. Core Grounding Capabilities

| Query Type | Example Question | Authoritative Data Source | Grounded Result |
|---|---|---|---|
| **Next Action** | *"What should I learn today?"* | `adaptiveService.getNextAction()` | Returns active milestone resource/project with pedagogical why-now rationale. |
| **Skill Gap** | *"Why is System Design still a gap for me?"* | `SkillGapAnalysis` & `Prerequisite` DAG | Explains target level (3/5), current level (1/5), and prerequisite blocking by architecture modules. |
| **Planning** | *"I only have 5 hours this week. What should I focus on?"* | Active Milestone Workload | Allocates exactly $\le 5$ hours of structured tasks without exceeding budget. |
| **Roadmap Adaptation** | *"Why did my roadmap change?"* | Assessment Evidence & Change Summary | Explains how 90% score on REST API assessment unlocked Milestone 2 (Spring Boot). |
| **Hallucination Defense** | *"Didn't I already complete System Design assessment?"* | `AssessmentAttempt` Database Records | Accurately confirms no completed attempt exists in profile records. |

---

## 3. Interactive Copilot Experience

- **Chat Interface (`/copilot`)**: Persistent conversation threads, markdown rendering, clickable starter prompt chips, and conversation deletion.
- **Grounding Attribution Badges**: Visual provenance tags (e.g. `✓ Authoritative Skill Gap Engine`, `✓ Active Milestone Roadmap`) displayed on assistant messages.
- **Safe Action Buttons**: Contextual triggers (*`[ Start: Build a REST API with Spring Boot → ]`*, *`[ Open Learning Roadmap → ]`*, *`[ View Skill Gaps → ]`*) that take learners directly to internal application workflows.
