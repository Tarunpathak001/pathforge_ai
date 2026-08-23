# Learning Path Sequencing & Scheduling Algorithm

## 1. Algorithmic Specification

The PathForge AI Learning Path Sequencing Algorithm produces an optimal, personalized, prerequisite-valid curriculum using graph theory and multi-objective scheduling.

---

## 2. Mathematical Formalization

Let:
- $S = \{s_1, s_2, \dots, s_n\}$ be the set of skills required for the target career.
- $L: S \to \{0, 1, 2, 3, 4, 5\}$ be the learner's current verified proficiency level.
- $R: S \to \{1, 2, 3, 4, 5\}$ be the target benchmark proficiency level.
- $G = (V, E)$ be the Skill Prerequisite Directed Acyclic Graph (DAG), where an edge $(u, v) \in E$ denotes that skill $u$ is a strict prerequisite for skill $v$.

### Step 1: Gap Filtering & Mastered Skill Exclusion
A skill $s$ is excluded from learning if:
$$L(s) \ge R(s)$$
The active gap set is:
$$S_{\text{gaps}} = \{s \in S \mid L(s) < R(s)\}$$

### Step 2: Prerequisite Closure
For every skill $s \in S_{\text{gaps}}$, we compute the upstream transitive closure in $G$:
$$\text{Closure}(s) = \{u \in V \mid u \leadsto s \text{ in } G \land L(u) < 2\}$$
The closed learning set is:
$$V^* = S_{\text{gaps}} \cup \bigcup_{s \in S_{\text{gaps}}} \text{Closure}(s)$$

### Step 3: Multi-Tier Topological Sorting (Kahn's Algorithm)
We restrict $G$ to the subgraph induced by $V^*$, denoted $G^* = (V^*, E^*)$.
In-degrees are computed for each node $v \in V^*$:
$$\text{deg}^-(v) = |\{u \in V^* \mid (u, v) \in E^*\}|$$

1. **Tier 0**: All nodes with $\text{deg}^-(v) = 0$ (ready to learn immediately).
2. **Tie-Breaking**: Nodes within the same tier are sorted descending by their Phase 3 priority score:
$$P(s) = 0.40 \cdot \text{Severity}(s) + 0.30 \cdot \text{Importance}(s) + 0.20 \cdot \text{PrerequisiteImpact}(s) + 0.10 \cdot \text{Readiness}(s)$$
3. **Subsequent Tiers**: As Tier $k$ nodes are resolved, downstream in-degrees are decremented. Nodes whose in-degree reaches $0$ enter Tier $k+1$.

### Step 4: Thematic Milestone Clustering
Topological tiers are partitioned into 3–6 thematic milestones based on domain categories (Foundations $\to$ Frameworks $\to$ Data/Caching $\to$ Distributed Architecture $\to$ System Design $\to$ Capstone Project).
Crucially, topological constraints are strictly preserved across milestones:
$$\forall (u, v) \in E^* \implies \text{MilestoneIndex}(u) \le \text{MilestoneIndex}(v)$$

### Step 5: Workload & Duration Calculation
For each milestone $M_i$:
$$H(M_i) = \sum_{r \in \text{Resources}(M_i)} \text{EstimatedHours}(r) + \text{PracticeBuffer}$$
$$\text{Weeks}(M_i) = \max\left(1, \left\lceil \frac{H(M_i)}{H_{\text{weekly}}} \right\rceil\right)$$

For the overall roadmap:
$$H_{\text{total}} = \sum_{i} H(M_i)$$
$$T_{\text{weeks}} = \max\left(1, \left\lceil \frac{H_{\text{total}}}{H_{\text{weekly}}} \right\rceil\right)$$

---

## 3. Path Validation Engine (The 10 Quality Rules)

Before persistence, every generated roadmap is validated against 10 strict rules:
1. **Prerequisite Dependency Rule**: No dependent skill appears in a milestone before its unmet prerequisite.
2. **Mastered Skill Rule**: Skills with $L(s) \ge R(s)$ are excluded from learning steps.
3. **Core Skills Priority Rule**: High-priority core gaps are scheduled as early as dependencies allow.
4. **Prerequisite Closure Rule**: Upstream unmastered dependencies are fully included.
5. **Non-Empty Milestones Rule**: Every non-capstone milestone has at least 1 skill.
6. **Measurable Objectives Rule**: Every milestone specifies 2–4 concrete learning objectives.
7. **Completion Criteria Rule**: Every milestone defines verifiable completion deliverables.
8. **Realistic Workload Rule**: Calendar weeks must align with weekly availability ($T = \lceil H / H_{\text{weekly}} \rceil$).
9. **Duplicate Skills Rule**: No skill appears across multiple milestones.
10. **Duplicate Resources Rule**: No duplicate resource appears within the same milestone.
