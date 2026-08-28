# Technical Architecture — Aggregated Dashboard & Data Synchronization (Phase 7)

## 1. Single Aggregator Endpoint (`GET /api/dashboard`)

To prevent frontend N+1 request waterfalls, the dashboard retrieves its complete payload via a single optimized endpoint:

```
GET /api/dashboard?careerSlug=backend-engineer
```

### Data Pipeline & Latency Optimization:
1. **Reads Existing Intelligence**: Queries pre-computed `SkillGapAnalysis`, `LearningPath`, `SkillState`, `ResourceProgress`, and `Recommendation` tables.
2. **Sub-200ms Execution**: Avoids redundant embedding generation or LLM calls on page load.
3. **Graceful Degradation**: Handles un-onboarded learners or learners without generated roadmaps with typed empty states.

---

## 2. Aggregated Schema Specification

```typescript
export interface DashboardSummary {
  user: { id: string; name: string; email: string };
  career: { id: string; name: string; slug: string; description: string; category: string; difficulty: string } | null;
  alignment: {
    score: number;
    band: string;
    delta: number;
    deltaReason: string;
    strongCount: number;
    developingCount: number;
    gapCount: number;
    summary: string;
    explanation: string;
  } | null;
  nextAction: NextAction | null;
  currentMilestone: DashboardCurrentMilestone | null;
  roadmap: DashboardRoadmapPreview | null;
  skillSummary: DashboardSkillSummary;
  recentSkillProgress: DashboardSkillProgressItem[];
  recommendations: DashboardRecommendationItem[];
  recentActivity: DashboardActivityItem[];
  weeklySummary: DashboardWeeklySummary;
  recentAdaptiveChange: AdaptiveChangeSummary | null;
  isStale: boolean;
  staleReason?: string;
  hasProfile: boolean;
  hasGapAnalysis: boolean;
  hasRoadmap: boolean;
}
```

---

## 3. Career Switching & Stale State Management

When a learner switches their target career via `POST /api/dashboard/switch-career`:
1. `LearnerProfile.targetRole` is updated in the database.
2. If `autoRecalculate: true`, `adaptiveService.recalculateAndAdapt()` generates fresh gap analysis and recommendations.
3. The updated dashboard payload is returned synchronously in a single roundtrip.
