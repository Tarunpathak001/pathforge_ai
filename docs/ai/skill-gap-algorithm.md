# Algorithm Specification: Deterministic Skill Gap Engine (`v1`)

## Overview

The **Skill Gap Algorithm (`v1`)** provides mathematical formulations for skill matching, gap severity, prerequisite readiness, multi-factor priority ranking, and overall career alignment scoring.

---

## 1. Skill Matching Strategy

Given learner skill input $s_{\text{learner}}$ and canonical career skill library $S_{\text{canonical}}$:

1. **Canonical ID Match**: If $s_{\text{learner}}.\text{id} == s_{\text{career}}.\text{id}$, match confidence = $1.0$.
2. **Exact Name & Slug Match**: Case-insensitive comparison of names and slugs, match confidence = $1.0$.
3. **Normalized Key Match**: Normalization removes whitespace, punctuation, and aliases (e.g. `"react.js"` $\to$ `"react"`), match confidence = $0.95$.
4. **Alias Dictionary Match**: Recognized aliases from canonical skill registry (e.g. `"psql"` $\to$ `"PostgreSQL"`, `"node"` $\to$ `"Node.js"`), match confidence = $0.90$.
5. **False-Positive Prevention**: Explicit pair exclusions strictly prevent conflation between distinct technical domains:
   - `Java` $\neq$ `JavaScript`
   - `C` $\neq$ `C++` $\neq$ `C#`
   - `Go` $\neq$ `GCP`
   - `R` $\neq$ `Rust`

---

## 2. Gap Calculation & Normalized Severity

For each career-required skill $s$:

$$\text{gap}(s) = \max(0, \text{requiredLevel}(s) - \text{effectiveLevel}(s))$$

$$ \text{gapSeverity}(s) = \begin{cases}
\frac{\text{gap}(s)}{\text{requiredLevel}(s)} & \text{if } \text{requiredLevel}(s) > 0 \\
0 & \text{otherwise}
\end{cases}$$

Clamped to range: $0.0 \le \text{gapSeverity}(s) \le 1.0$.

---

## 3. Career Importance Weights

| Importance Tier | Deterministic Weight ($W_{\text{imp}}$) | Rationale |
| :--- | :---: | :--- |
| **`CORE`** | **1.00** | Non-negotiable foundational competence for day-to-day role execution. |
| **`HIGH`** | **0.80** | Strongly expected across industry engineering teams. |
| **`MEDIUM`** | **0.50** | Important supporting tool, runtime, or conceptual skill. |
| **`OPTIONAL`** | **0.20** | Beneficial specialization or nice-to-have capability. |

---

## 4. Prerequisite Readiness & Impact

### Prerequisite Readiness Score ($S_{\text{ready}}$)
- **`READY` ($1.0$)**: All direct prerequisite skills have $\text{effectiveLevel} \ge \min(2, \text{requiredLevel})$.
- **`PARTIALLY_READY` ($0.5$)**: At least 50% of direct prerequisites are satisfied.
- **`BLOCKED` ($0.1$)**: Key foundational prerequisites have 0 recorded proficiency.

### Prerequisite Impact Score ($S_{\text{impact}}$)
Calculated as the normalized count of downstream career-required skills that depend on this skill in the DAG:

$$S_{\text{impact}}(s) = \min\left(1.0, \frac{\text{downstreamCareerDependents}(s)}{3.0}\right)$$

---

## 5. Multi-Factor Priority Scoring Formula

The priority score determines the recommended learning sequence, prioritizing skills that close large gaps in core competencies while respecting prerequisite readiness:

$$\text{priorityScore}(s) = 0.40 \cdot \text{gapSeverity}(s) + 0.30 \cdot W_{\text{imp}}(s) + 0.20 \cdot S_{\text{impact}}(s) + 0.10 \cdot S_{\text{ready}}(s)$$

- If $\text{gap}(s) = 0$, $\text{priorityScore}(s) = 0.0$ (no action required).
- Scaled for UI display: $\text{displayPriority}(s) = \text{round}(\text{priorityScore}(s) \times 100)$.

---

## 6. Career Alignment Score Formula

The overall percentage score reflecting alignment with the career's modeled competency requirements:

$$\text{achievement}(s) = \min\left(\frac{\text{effectiveLevel}(s)}{\text{requiredLevel}(s)}, 1.0\right)$$

$$\text{Career Readiness Score} = \text{round}\left(\frac{\sum_{s \in S} \text{achievement}(s) \cdot W_{\text{imp}}(s)}{\sum_{s \in S} W_{\text{imp}}(s)} \times 100\right)$$
$$
