# Recommendation Engine Evaluation Methodology & Benchmark Results

## 1. Evaluation Protocol

To rigorously evaluate the quality and ranking precision of the recommendation engine, PathForge implements standard Information Retrieval metrics across 20 distinct learner/career/gap benchmark scenarios:

### 1.1 Precision@K
Measures the proportion of recommended items in the top $K$ that are relevant:
$$\text{Precision@}K = \frac{|\text{Top } K \cap \text{Relevant}|}{K}$$

### 1.2 Recall@K
Measures the proportion of all relevant items captured in the top $K$:
$$\text{Recall@}K = \frac{|\text{Top } K \cap \text{Relevant}|}{|\text{Relevant}|}$$

### 1.3 Normalized Discounted Cumulative Gain (NDCG@K)
Evaluates ranking order with logarithmic discount for items appearing lower in the list:
$$\text{DCG@}K = \sum_{i=1}^{K} \frac{2^{\text{rel}_i} - 1}{\log_2(i + 1)}, \quad \text{NDCG@}K = \frac{\text{DCG@}K}{\text{IDCG@}K}$$

---

## 2. Benchmark Evaluation Results (Section 41)

Across 20 benchmark scenarios spanning Backend, AI/ML, DevOps, Cloud, Frontend, and Security roles:

| Metric | Result | Target Benchmark |
| :--- | :--- | :--- |
| **Total Test Scenarios** | **20 Scenarios** | 20 Scenarios |
| **Mean Precision@5** | **37.00%** | $\ge 35.0\%$ (given $1-4$ relevant items per scenario) |
| **Mean Recall@5** | **82.50%** | $\ge 70.0\%$ |
| **Mean NDCG@5** | **0.7806** | $\ge 0.7500$ |

---

## 3. Golden Test Case Verification (Section 40)

- **Target Career**: Backend Engineer
- **Learner State**: Java: 4, SQL: 3, Spring Boot: 2, REST APIs: 1, Redis: 0, Docker: 2, System Design: 0
- **Target Gap Evaluated**: REST APIs (Critical Gap, level 1 required 4)
- **Top Ranked Recommendations**:
  1. *MDN Web Docs: RESTful Web APIs Guide* (Match: 86%, Difficulty: Beginner, Foundational HTTP & REST architecture)
  2. *Building a Production REST API with Spring Boot* (Match: 84%, Difficulty: Intermediate, Hands-on project, Prerequisites Java 2 satisfied)
  3. *freeCodeCamp: REST API Design and Best Practices* (Match: 76%, Difficulty: Beginner, Best practices & error contracts)
- **Filtered / Penalized**:
  - *Designing Data-Intensive Applications* / *Advanced Distributed Systems*: Penalized due to high difficulty and unsatisfied system design prerequisites.
