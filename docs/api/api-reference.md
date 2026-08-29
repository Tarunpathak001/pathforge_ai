# PathForge AI — REST API Reference Documentation

## Base URL
- **Local Development**: `http://localhost:3001/api`
- **Header Authentication**: `x-user-id: <user_id>` (Defaults to `demo-learner-id`)

---

## 1. System Health & Readiness

### `GET /health`
- **Description**: Lightweight operational liveness check.
- **Response**: `200 OK`
  ```json
  {
    "status": "ok",
    "service": "pathforge-api",
    "version": "1.0.0",
    "uptimeSeconds": 142
  }
  ```

### `GET /health/ready`
- **Description**: Readiness check verifying database connectivity and dataset seed status.
- **Response**: `200 OK`
  ```json
  {
    "status": "ready",
    "database": "connected",
    "latencyMs": 8,
    "dataset": {
      "skills": 72,
      "careers": 15,
      "learningResources": 50,
      "assessments": 6,
      "seeded": true,
      "demoLearnerReady": true
    }
  }
  ```

---

## 2. Profile & Learner Intelligence (`/api/profile`)

- `GET /api/profile`: Fetch the authenticated learner's complete profile.
- `POST /api/profile`: Create a learner profile with normalized skills and preferences.
- `PATCH /api/profile`: Incrementally update profile fields.
- `POST /api/profile/ai-extract`: Extract structured profile JSON from freeform text.

---

## 3. Career & Skill Intelligence (`/api/careers`, `/api/skills`)

- `GET /api/careers`: List all 15 industry-modeled careers.
- `GET /api/careers/:slug`: Get career details and required skill mappings.
- `GET /api/skills`: List canonical skills with aliases and categories.
- `GET /api/skills/dag`: Retrieve full topological prerequisite dependency graph.

---

## 4. Skill Gap Engine (`/api/skill-gap`)

- `POST /api/skill-gap/analyze`: Run multi-factor gap analysis for target career.
  - Body: `{ "careerSlug": "backend-engineer" }`
- `GET /api/skill-gap/latest`: Retrieve latest saved analysis.
- `GET /api/skill-gap/:id`: Fetch specific analysis by UUID.

---

## 5. Learning Resource Recommendations (`/api/recommendations`)

- `POST /api/recommendations/generate`: Generate hybrid ranked recommendations.
  - Body: `{ "careerSlug": "backend-engineer", "maxPerGap": 3, "includeSemantic": true }`
- `GET /api/recommendations`: Retrieve latest recommendation set.

---

## 6. Personalized Learning Path & Roadmap (`/api/learning-path`)

- `POST /api/learning-path/generate`: Generate topological multi-milestone learning path.
  - Body: `{ "careerSlug": "backend-engineer", "weeklyHours": 10, "regenerate": true }`
- `GET /api/learning-path`: Fetch active roadmap with milestone progress.

---

## 7. Progress & Assessments (`/api/progress`, `/api/assessments`)

- `POST /api/progress/resources/:id/start`: Start resource progress tracking.
- `PATCH /api/progress/resources/:id`: Update progress percentage (0–100%).
- `GET /api/assessments`: List domain assessments.
- `POST /api/assessments/:id/attempt`: Submit verified quiz answers.

---

## 8. Adaptive Learning Engine (`/api/adaptive`)

- `POST /api/adaptive/recalculate`: Recalculate skill confidence, resolve gaps, and re-sequence roadmap.
- `GET /api/adaptive/next-action`: Get authoritative next best learning task.

---

## 9. Unified Dashboard (`/api/dashboard`)

- `GET /api/dashboard`: Aggregated dashboard response under 200ms latency.
- `POST /api/dashboard/switch-career`: Switch active target career with optional instant adaptation.

---

## 10. Grounded Career Copilot (`/api/copilot`)

- `POST /api/copilot/conversations`: Start conversation thread.
- `GET /api/copilot/conversations`: List learner conversations.
- `GET /api/copilot/conversations/:id`: Retrieve conversation messages.
- `POST /api/copilot/conversations/:id/messages`: Submit user prompt & receive grounded response.
- `DELETE /api/copilot/conversations/:id`: Delete conversation thread.
