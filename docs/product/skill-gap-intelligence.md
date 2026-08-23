# Product Specification: Personalized Skill Gap Intelligence Engine

## Overview

The **Personalized Skill Gap Intelligence Engine** in **PathForge AI** evaluates a learner's validated competencies against the modeled benchmarks of a target career.

The engine answers three fundamental career development questions:

1. **"What skills am I missing for this career path?"**
2. **"How severe is each gap relative to industry expectations?"**
3. **"Which skill should I prioritize learning first to maximize my career progression?"**

---

## 1. Core Principles

- **Deterministic & Reproducible**: The calculation produces the exact same numerical readiness score and priority rank for identical learner and career profiles.
- **Explainable by Design**: Every gap includes a transparent, structured explanation detailing the level discrepancy, role importance, prerequisite blockers, and downstream systems impact.
- **Prerequisite-Aware Prioritization**: Foundational dependencies (e.g. `REST APIs` before `System Design`) are surfaced first, preventing learners from tackling advanced topics before mastering core prerequisites.
- **Decoupled Architecture**: Numerical gap analysis runs locally without external LLM dependencies, ensuring sub-second response times and high availability.

---

## 2. Skill Gap Categories

For any target career, required skills are classified into four distinct operational categories:

| Category          | Definition                                                                                                                     |   Visual Indicator    |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------- | :-------------------: |
| **Strengths**     | Learner proficiency meets or exceeds the career's required level ($\text{Learner} \ge \text{Required}$).                       | `✓ Strength` (Green)  |
| **Developing**    | Learner possesses foundational experience but has not reached the required benchmark ($0 < \text{Learner} < \text{Required}$). | `◐ Developing` (Cyan) |
| **Missing**       | Learner has no recorded experience or evidence for this required competency ($\text{Learner} = 0$).                            |  `○ Missing` (Slate)  |
| **Critical Gaps** | High-severity gaps in `CORE` or `HIGH` importance skills that demand immediate focus.                                          | `⚡ Critical` (Rose)  |

---

## 3. Career Alignment Score & Readiness Bands

The overall **Career Alignment Score** is a normalized weighted percentage (0% to 100%) indicating how closely a learner's current profile aligns with the target career's modeled expectations:

$$\text{Career Alignment Score} = \text{round}\left(\frac{\sum_{s} \min\left(\frac{L_s}{R_s}, 1.0\right) \cdot W_s}{\sum_{s} W_s} \times 100\right)$$

### Qualitative Interpretation Bands

|  Score Range   | Readiness Band        | Product Meaning                                                                    |
| :------------: | :-------------------- | :--------------------------------------------------------------------------------- |
| **86% – 100%** | **Career Ready**      | Proficiencies closely match or exceed target role benchmarks.                      |
| **71% – 85%**  | **Strong Progress**   | Core competencies established; finalizing specialized competencies.                |
| **51% – 70%**  | **Developing**        | Foundational knowledge established; working through core and high-importance gaps. |
| **31% – 50%**  | **Early Development** | Basic competencies present; significant core technical gaps to address.            |
|  **0% – 30%**  | **Starting Point**    | Beginning skill acquisition in this career domain.                                 |

> [!NOTE]
> The Career Alignment Score reflects alignment with modeled role benchmarks and does not represent an objective employment guarantee.

---

## 4. Prerequisite Readiness States

Every skill evaluated by the engine is assigned a **Prerequisite Readiness Status**:

- **`READY`**: All direct prerequisites are satisfied ($\text{Level} \ge \min(2, \text{Required})$). The learner can immediately start studying this skill.
- **`PARTIALLY_READY`**: Some foundational prerequisites are in progress, but not all are fully met.
- **`BLOCKED`**: Critical prerequisite concepts have 0 competency. The learner is guided to master prerequisites first.
