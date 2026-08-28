# Algorithmic Specification — Deterministic Skill Inference & Adaptive Re-ranking (Phase 6)

## 1. Mathematical Formulation

### 1.1 Evidence Weighting Model
Each observation $e_i \in \mathcal{E}(s)$ associated with skill $s$ carries an evidence weight $w_i$ and base confidence $c_i$:

$$\begin{aligned}
w_{\text{Assessment}} &= 0.85, \quad c_{\text{Assessment}} = 0.90 \\
w_{\text{Project}} &= 0.70, \quad c_{\text{Project}} = 0.80 \\
w_{\text{Resource}} &= 0.30, \quad c_{\text{Resource}} = 0.55 \\
w_{\text{SelfReport}} &= 0.20, \quad c_{\text{SelfReport}} = 0.35 \\
w_{\text{Feedback}} &= 0.15, \quad c_{\text{Feedback}} = 0.40
\end{aligned}$$

### 1.2 Aggregated Score & Proficiency Level Mapping
$$\bar{S}(s) = \frac{\sum_{i=1}^{N} w_i \cdot S(e_i)}{\sum_{i=1}^{N} w_i}$$

$$\text{Level}(s) = \begin{cases}
5, & \bar{S}(s) \ge 90 \\
4, & 75 \le \bar{S}(s) < 90 \\
3, & 60 \le \bar{S}(s) < 75 \\
2, & 40 \le \bar{S}(s) < 60 \\
1, & \bar{S}(s) < 40
\end{cases}$$

### 1.3 Confidence Scaling
$$C(s) = \min\left(0.95, \max_{i} c_i + \delta_{N}\right)$$
where $\delta_N = 0.05$ when $N \ge 3$ distinct evidence sources exist.

---

## 2. Recommendation Feedback Adjustment

Let $R_0(r)$ be the initial cosine semantic match score for resource $r$ against gap skill $s$. The adjusted score $R^*(r)$ is:

$$R^*(r) = R_0(r) \cdot \prod_{f \in \mathcal{F}(r)} \gamma(f)$$

where:
- $\gamma(\text{TOO\_EASY}) = 0.60$ for beginner resources if $\text{Level}(s) \ge 3$.
- $\gamma(\text{TOO\_DIFFICULT}) = 0.65$ for advanced resources if $\text{Level}(s) \le 2$.
- $\gamma(\text{NOT\_RELEVANT}) = 0.30$.
- $\gamma(\text{VERY\_USEFUL}) = 1.20$.

---

## 3. Next Best Action Heuristics

The Next Best Action engine evaluates candidate actions $\mathcal{A}$ in the active milestone:

1. **Active In-Progress Resource**: Priority $= 95$
   $$\text{Remaining Time} = T_{\text{estimated}} \times (1 - \text{progressPercent})$$
2. **Unstarted Primary Milestone Resource**: Priority $= 90$
3. **Assessment for Completed Milestone Skills**: Priority $= 85$
4. **Milestone Capstone / Project Deliverable**: Priority $= 80$
