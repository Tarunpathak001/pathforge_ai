/**
 * Recommendation Evaluation Metrics Engine
 * Provides Precision@K, Recall@K, and Normalized Discounted Cumulative Gain (NDCG@K)
 */

export interface BenchmarkScenario {
  id: string;
  careerName: string;
  targetSkillSlug: string;
  learnerProfile: any;
  relevantResourceSlugs: string[]; // Set of known relevant ground truth resources
  relevanceGrades?: Record<string, number>; // slug -> grade (e.g. 3 = highly relevant, 2 = relevant, 1 = marginal, 0 = irrelevant)
}

export interface ScenarioEvaluationResult {
  scenarioId: string;
  precisionAtK: number;
  recallAtK: number;
  ndcgAtK: number;
  retrievedSlugs: string[];
  relevantSlugs: string[];
}

export interface BenchmarkReport {
  totalScenarios: number;
  meanPrecisionAt5: number;
  meanRecallAt5: number;
  meanNDCGAt5: number;
  scenarioResults: ScenarioEvaluationResult[];
}

export function calculatePrecisionAtK(
  retrievedIds: string[],
  relevantIds: string[],
  k = 5
): number {
  if (k <= 0) return 0;
  const topK = retrievedIds.slice(0, k);
  const relevantSet = new Set(relevantIds.map(id => id.toLowerCase()));
  const matches = topK.filter(id => relevantSet.has(id.toLowerCase())).length;
  return Number((matches / k).toFixed(4));
}

export function calculateRecallAtK(
  retrievedIds: string[],
  relevantIds: string[],
  k = 5
): number {
  if (relevantIds.length === 0) return 1.0;
  const topK = retrievedIds.slice(0, k);
  const relevantSet = new Set(relevantIds.map(id => id.toLowerCase()));
  const matches = topK.filter(id => relevantSet.has(id.toLowerCase())).length;
  return Number((matches / relevantIds.length).toFixed(4));
}

export function calculateDCGAtK(
  rankedIds: string[],
  relevanceGrades: Record<string, number>,
  k = 5
): number {
  const topK = rankedIds.slice(0, k);
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    const id = (topK[i] ?? '').toLowerCase();
    const grade = relevanceGrades[id] || 0;
    // DCG formula: (2^rel - 1) / log2(i + 2)
    dcg += (Math.pow(2, grade) - 1) / Math.log2(i + 2);
  }
  return dcg;
}

export function calculateNDCGAtK(
  rankedIds: string[],
  relevanceGrades: Record<string, number>,
  k = 5
): number {
  const actualDCG = calculateDCGAtK(rankedIds, relevanceGrades, k);

  // Calculate Ideal DCG (IDCG) by sorting grades descending
  const idealGrades = Object.values(relevanceGrades).sort((a, b) => b - a);
  let idcg = 0;
  const idealLimit = Math.min(k, idealGrades.length);
  for (let i = 0; i < idealLimit; i++) {
    const grade = idealGrades[i] ?? 0;
    idcg += (Math.pow(2, grade) - 1) / Math.log2(i + 2);
  }

  if (idcg === 0) return 0.0;
  return Number((actualDCG / idcg).toFixed(4));
}

export function evaluateBenchmark(
  scenarios: BenchmarkScenario[],
  runScenario: (scenario: BenchmarkScenario) => string[], // returns ranked slugs
  k = 5
): BenchmarkReport {
  const scenarioResults: ScenarioEvaluationResult[] = [];
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalNDCG = 0;

  for (const sc of scenarios) {
    const retrievedSlugs = runScenario(sc);
    const pAtK = calculatePrecisionAtK(retrievedSlugs, sc.relevantResourceSlugs, k);
    const rAtK = calculateRecallAtK(retrievedSlugs, sc.relevantResourceSlugs, k);

    // Build default relevance grades if not provided (2 = relevant, 0 = not)
    const grades =
      sc.relevanceGrades ||
      sc.relevantResourceSlugs.reduce((acc, slug) => {
        acc[slug.toLowerCase()] = 2;
        return acc;
      }, {} as Record<string, number>);

    const ndcgAtK = calculateNDCGAtK(retrievedSlugs, grades, k);

    totalPrecision += pAtK;
    totalRecall += rAtK;
    totalNDCG += ndcgAtK;

    scenarioResults.push({
      scenarioId: sc.id,
      precisionAtK: pAtK,
      recallAtK: rAtK,
      ndcgAtK,
      retrievedSlugs: retrievedSlugs.slice(0, k),
      relevantSlugs: sc.relevantResourceSlugs,
    });
  }

  const count = scenarios.length || 1;
  return {
    totalScenarios: scenarios.length,
    meanPrecisionAt5: Number((totalPrecision / count).toFixed(4)),
    meanRecallAt5: Number((totalRecall / count).toFixed(4)),
    meanNDCGAt5: Number((totalNDCG / count).toFixed(4)),
    scenarioResults,
  };
}
