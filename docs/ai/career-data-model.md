# Career & Skill Data Model for AI Recommendation Engine

## 1. Purpose & Phase 3 Bridge

The Career and Skill Intelligence models built in Phase 2 provide the objective ground-truth data required by Phase 3 (Skill Gap Engine) and Phase 4 (Learning Path Generation).

This document formalizes the mathematical and semantic representations used across the platform.

---

## 2. Core Separation of Concerns

```text
┌────────────────────────────────────────────────────────┐
│                   LEARNER STATE                        │
│ Learner Profile:                                       │
│ - LearnerSkill.selfReportedLevel ∈ {1, 2, 3, 4, 5}     │
│ - LearnerSkill.confidence ∈ {1, 2, 3, 4, 5}            │
│ - LearnerSkill.evidence: Verified projects & certs     │
└────────────────────────────────────────────────────────┘
                           VS
┌────────────────────────────────────────────────────────┐
│                 CAREER BENCHMARK                       │
│ Career Skill Profile:                                  │
│ - CareerSkill.requiredLevel ∈ {1, 2, 3, 4, 5}          │
│ - CareerSkill.importance ∈ {CORE, HIGH, MED, OPT}      │
│ - SkillPrerequisite.strength ∈ {REQ, REC, HELP}        │
└────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> Never conflate learner self-reported proficiency with career target requirements. They reside in distinct database tables (`LearnerSkill` vs `CareerSkill`) and use separate schemas.

---

## 3. Skill Gap Formulation (For Phase 3)

For any target career $C$ and learner $L$:

Let $S_C$ be the set of skills required by career $C$.

For each skill $s \in S_C$:

- $R(s) = \text{CareerSkill}(C, s).\text{requiredLevel} \in [1, 5]$
- $I(s) = \text{CareerSkill}(C, s).\text{importance} \in \{1.0 \text{ (CORE)}, 0.75 \text{ (HIGH)}, 0.5 \text{ (MEDIUM)}, 0.25 \text{ (OPTIONAL)}\}$
- $L(s) = \begin{cases} \text{LearnerSkill}(L, s).\text{selfReportedLevel} & \text{if } s \in \text{LearnerSkills}(L) \\ 0 & \text{otherwise} \end{cases}$

The raw skill gap is:
$$\text{Gap}(s) = \max(0, R(s) - L(s))$$

The weighted priority score for curriculum ordering is:
$$\text{Priority}(s) = \text{Gap}(s) \times I(s) \times \text{TopologicalWeight}(s)$$

Where $\text{TopologicalWeight}(s)$ ensures foundational prerequisites are addressed prior to advanced specializations.

---

## 4. Career-Skill Rationale & Explainability

Each `CareerSkill` relationship contains a curated `rationale` field.

Example:

```json
{
  "skill": "Redis",
  "career": "Backend Engineer",
  "importance": "HIGH",
  "requiredLevel": 3,
  "rationale": "Redis is commonly used for caching, session storage, and rate limiting to reduce database pressure under high concurrency."
}
```

These rationales provide the explainability layer for AI recommendations, answering:

- _"Why is this skill recommended for my learning path?"_
- _"Why is this skill prioritized before distributed system design?"_
