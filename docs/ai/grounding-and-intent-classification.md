# AI Grounding, Intent Classification & Evaluation Methodology (Phase 8)

## 1. Intent Classification Engine

PathForge implements a fast, deterministic intent router (`classifyCopilotIntent`) operating across 11 core intents:

- `NEXT_ACTION`: Resolves immediate study recommendation and active milestone.
- `PLANNING`: Resolves weekly availability constraints and study time budget.
- `SKILL_GAP`: Analyzes strengths, gap severities, and prerequisite readiness.
- `ROADMAP`: Explains milestone sequencing, skip criteria, and adaptive changes.
- `RECOMMENDATION`: Deconstructs multi-factor matching scores and format fit.
- `PROGRESS`: Reports career alignment percentage, verified improvements, and hours logged.
- `ASSESSMENT`: Verifies official assessment attempts and prevents fake completion claims.
- `CAREER_REQUIREMENTS`: Summarizes modeled skills and target career profiles.
- `CONCEPT_EXPLANATION` & `GENERAL_LEARNING`: Explains technical concepts connected back to the learner's PathForge roadmap.

---

## 2. Structured Response Schema

```typescript
export interface CopilotStructuredResponse {
  answer: string;
  intent: CopilotIntent;
  groundingSources: string[];
  citations: string[];
  suggestedActions: Array<{
    type: 'OPEN_RESOURCE' | 'OPEN_MILESTONE' | 'OPEN_ASSESSMENT' | 'OPEN_SKILL' | 'OPEN_PATH' | 'OPEN_DASHBOARD' | 'OPEN_RECOMMENDATIONS' | 'OPEN_GAP_ANALYSIS';
    title: string;
    target: string;
    payload?: Record<string, any>;
  }>;
}
```

---

## 3. Grounding Evaluation Benchmark Suite

The Copilot is evaluated against a 35+ benchmark question dataset (`COPILOT_EVALUATION_DATASET`) verifying that:
1. Expected ground-truth facts are present in every response.
2. Forbidden hallucinated keywords are never emitted.
3. Suggested actions point to existing, valid PathForge targets.
