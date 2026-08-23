# Recommendation Ranking Algorithm & Math Specification

## 1. Mathematical Formulation

### 1.1 Composite Score Equation
Let $R$ be a candidate learning resource, $G$ be the target skill gap, and $L$ be the learner profile. The composite score $\mathcal{S}(R, G, L) \in [0, 1]$ is:

$$\mathcal{S}(R, G, L) = \sum_{k \in \mathcal{K}} w_k \cdot s_k(R, G, L)$$

Subject to $\sum_{k} w_k = 1.0$, where component weights are:
- $w_{\text{semantic}} = 0.30$
- $w_{\text{coverage}} = 0.25$
- $w_{\text{career}} = 0.15$
- $w_{\text{difficulty}} = 0.10$
- $w_{\text{prerequisite}} = 0.08$
- $w_{\text{preference}} = 0.07$
- $w_{\text{quality}} = 0.05$

---

## 2. Component Scoring Definitions

### 2.1 Semantic Relevance Score ($s_{\text{semantic}} \in [0, 1]$)
Cosine similarity between query embedding $\mathbf{q} \in \mathbb{R}^{64}$ and resource embedding $\mathbf{v}_R \in \mathbb{R}^{64}$:

$$s_{\text{semantic}} = \max\left(0, \frac{\mathbf{q} \cdot \mathbf{v}_R}{\|\mathbf{q}\|_2 \|\mathbf{v}_R\|_2}\right)$$

### 2.2 Skill Coverage Depth ($s_{\text{coverage}} \in [0, 1]$)
$$s_{\text{coverage}} = \begin{cases} 
1.00 & \text{if coverage} = \text{PRIMARY} \\
0.65 & \text{if coverage} = \text{SUPPORTING} \\
0.35 & \text{if coverage} = \text{MENTIONED} \\
0.10 & \text{otherwise}
\end{cases}$$

### 2.3 Career Importance Score ($s_{\text{career}} \in [0, 1]$)
$$s_{\text{career}} = \begin{cases} 
1.00 & \text{if importance} = \text{CORE} \\
0.80 & \text{if importance} = \text{HIGH} \\
0.55 & \text{if importance} = \text{MEDIUM} \\
0.30 & \text{if importance} = \text{OPTIONAL}
\end{cases}$$

### 2.4 Difficulty Fit Calibration ($s_{\text{difficulty}} \in [0, 1]$)
Based on learner current proficiency level $l \in [0, 5]$:
- For $l \le 2$: `BEGINNER` $\to 1.0$, `INTERMEDIATE` $\to 0.7$, `ADVANCED` $\to 0.2$
- For $l = 3$: `INTERMEDIATE` $\to 1.0$, `BEGINNER` $\to 0.6$, `ADVANCED` $\to 0.75$
- For $l \ge 4$: `ADVANCED` $\to 1.0$, `INTERMEDIATE` $\to 0.8$, `BEGINNER` $\to 0.3$

### 2.5 Prerequisite Readiness Fit ($s_{\text{prerequisite}} \in [0, 1]$)
- If gap is `READY`: $1.0$
- If gap is `PARTIALLY_READY`: $0.6$
- If gap is `NOT_READY`: $0.15$
- In addition, for each prerequisite $P$ required by resource $R$, if learner level $l_P < \text{reqLevel}(P)$, $s_{\text{prerequisite}} \leftarrow \min(s_{\text{prerequisite}}, 0.30)$.

### 2.6 Fallback Mode Guarantee
If embeddings are disabled, $w_{\text{semantic}} = 0$ and the remaining 6 weights are normalized:
$$w'_i = \frac{w_i}{\sum_{j \neq \text{semantic}} w_j}$$
ensuring deterministic ranking operates reliably without external vector service dependencies.
