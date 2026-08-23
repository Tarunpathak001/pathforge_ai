import type {
  LearningResource,
  RecommendationItem,
  RecommendationScoreBreakdown,
  SkillGapRecommendationGroup,
  RecommendationWeights,
} from '../types/recommendation.js';
import {
  DEFAULT_RECOMMENDATION_WEIGHTS,
  MIN_RECOMMENDATION_SCORE_THRESHOLD,
} from '../types/recommendation.js';
import type { SkillGapItem } from '../types/skill-gap.js';
import type { LearnerProfile, LearningPreference } from '../types/profile.js';
import type { CareerImportance } from '../types/career.js';
import {
  cosineSimilarity,
  generateTextEmbedding,
  buildQueryEmbeddingText,
} from './embedding-generator.js';

export interface ScoreResourceParams {
  resource: LearningResource;
  targetGap: SkillGapItem;
  careerName: string;
  careerImportance: CareerImportance;
  learnerProfile: LearnerProfile;
  learnerPreference?: LearningPreference | null;
  queryEmbedding?: number[];
  weights?: RecommendationWeights;
  isSemanticFallback?: boolean;
}

/**
 * Evaluates and scores a single candidate resource against a learner's skill gap.
 */
export function scoreResource(params: ScoreResourceParams): RecommendationScoreBreakdown {
  const {
    resource,
    targetGap,
    careerImportance,
    learnerProfile,
    learnerPreference,
    queryEmbedding,
    weights = DEFAULT_RECOMMENDATION_WEIGHTS,
    isSemanticFallback = false,
  } = params;

  // 1. Semantic Relevance Score (0.0 to 1.0)
  let semanticScore = 0.0;
  if (!isSemanticFallback && queryEmbedding && resource.embedding) {
    const resourceVector = Array.isArray(resource.embedding)
      ? resource.embedding
      : typeof resource.embedding === 'string'
      ? JSON.parse(resource.embedding)
      : [];
    semanticScore = cosineSimilarity(queryEmbedding, resourceVector);
  }

  // 2. Skill Coverage Score (0.0 to 1.0)
  const directMapping = resource.skills?.find(
    s =>
      s.skillId === targetGap.skillId ||
      s.skillSlug === targetGap.skillSlug ||
      s.skillName?.toLowerCase() === targetGap.skillName.toLowerCase()
  );

  let coverageScore = 0.0;
  if (directMapping) {
    switch (directMapping.coverage) {
      case 'PRIMARY':
        coverageScore = 1.0;
        break;
      case 'SUPPORTING':
        coverageScore = 0.65;
        break;
      case 'MENTIONED':
        coverageScore = 0.25;
        break;
    }
  } else {
    // Check if resource covers any prerequisite of this skill gap
    const prereqMapping = resource.skills?.some(s =>
      targetGap.prerequisites?.some(p => p.prerequisiteSkillId === s.skillId)
    );
    if (prereqMapping) {
      coverageScore = 0.35;
    }
  }

  // 3. Career Importance Score (0.0 to 1.0)
  let careerScore = 0.5;
  switch (careerImportance) {
    case 'CORE':
      careerScore = 1.0;
      break;
    case 'HIGH':
      careerScore = 0.8;
      break;
    case 'MEDIUM':
      careerScore = 0.5;
      break;
    case 'OPTIONAL':
      careerScore = 0.2;
      break;
  }

  // 4. Difficulty Fit Score (0.0 to 1.0)
  const learnerLvl = targetGap.learnerLevel;
  let difficultyScore = 0.5;
  if (learnerLvl <= 2) {
    // Beginner learner
    if (resource.difficulty === 'BEGINNER') difficultyScore = 1.0;
    else if (resource.difficulty === 'INTERMEDIATE') difficultyScore = 0.65;
    else difficultyScore = 0.2; // ADVANCED penalty
  } else if (learnerLvl === 3) {
    // Intermediate learner
    if (resource.difficulty === 'INTERMEDIATE') difficultyScore = 1.0;
    else if (resource.difficulty === 'BEGINNER') difficultyScore = 0.75;
    else difficultyScore = 0.7;
  } else {
    // Advanced learner (4 or 5)
    if (resource.difficulty === 'ADVANCED') difficultyScore = 1.0;
    else if (resource.difficulty === 'INTERMEDIATE') difficultyScore = 0.8;
    else difficultyScore = 0.35;
  }

  // 5. Prerequisite Fit Score (0.0 to 1.0)
  let prerequisiteScore = 1.0;
  if (targetGap.readiness === 'BLOCKED') {
    prerequisiteScore = 0.15; // Heavy penalty if learner lacks foundational skills for this gap
  } else if (targetGap.readiness === 'PARTIALLY_READY') {
    prerequisiteScore = 0.6;
  }

  // Check resource-specific prerequisites if defined
  if (resource.prerequisites && resource.prerequisites.length > 0) {
    for (const req of resource.prerequisites) {
      const learnerSkill = learnerProfile?.skills?.find(
        ls =>
          (ls.normalizedName && req.skillSlug && ls.normalizedName === req.skillSlug) ||
          (ls.name && req.skillName && ls.name.toLowerCase() === req.skillName.toLowerCase())
      );
      const level = learnerSkill?.selfReportedLevel || 0;
      if (level < req.requiredLevel) {
        prerequisiteScore = Math.min(prerequisiteScore, 0.3);
      }
    }
  }

  // 6. Learning Preference Fit Score (0.0 to 1.0)
  let preferenceScore = 0.8;
  const learningFormat = learnerPreference?.learningFormat || 'MIXED';
  const availability = learnerPreference?.weeklyAvailabilityHours || '10-15';
  const parsedHours = availability.includes('15') ? 15 : availability.includes('10') ? 10 : 5;

  // Format matching
  let formatScore = 0.8;
  if (learningFormat === 'PROJECTS' || learningFormat === 'INTERACTIVE') {
    if (resource.resourceType === 'PROJECT') formatScore = 1.0;
    else if (resource.resourceType === 'EXERCISE') formatScore = 0.95;
    else if (resource.resourceType === 'COURSE') formatScore = 0.8;
    else if (resource.resourceType === 'DOCUMENTATION') formatScore = 0.7;
    else if (resource.resourceType === 'VIDEO') formatScore = 0.7;
    else formatScore = 0.45;
  } else if (learningFormat === 'VIDEO') {
    if (resource.resourceType === 'VIDEO') formatScore = 1.0;
    else if (resource.resourceType === 'COURSE') formatScore = 0.9;
    else if (resource.resourceType === 'PROJECT') formatScore = 0.75;
    else formatScore = 0.5;
  } else if (learningFormat === 'DOCUMENTATION' || learningFormat === 'ARTICLES') {
    if (resource.resourceType === 'BOOK') formatScore = 1.0;
    else if (resource.resourceType === 'DOCUMENTATION') formatScore = 0.95;
    else if (resource.resourceType === 'ARTICLE') formatScore = 0.9;
    else if (resource.resourceType === 'COURSE') formatScore = 0.7;
    else formatScore = 0.5;
  }

  // Duration fit
  let durationScore = 1.0;
  if (resource.estimatedHours > parsedHours * 3) {
    durationScore = Math.max(0.4, 1.0 - (resource.estimatedHours - parsedHours * 3) / 50);
  }

  preferenceScore = Number((formatScore * 0.7 + durationScore * 0.3).toFixed(4));

  // 7. Resource Quality Score (0.0 to 1.0)
  const qualityScore = Number(Math.max(0, Math.min(1, resource.qualityScore || 0.85)).toFixed(4));

  // Final Weighted Score Calculation
  let finalScore = 0;
  if (isSemanticFallback) {
    // Re-normalize remaining 6 weights
    const sumRemaining =
      weights.coverageWeight +
      weights.careerWeight +
      weights.difficultyWeight +
      weights.prerequisiteWeight +
      weights.preferenceWeight +
      weights.qualityWeight;

    finalScore =
      (coverageScore * weights.coverageWeight +
        careerScore * weights.careerWeight +
        difficultyScore * weights.difficultyWeight +
        prerequisiteScore * weights.prerequisiteWeight +
        preferenceScore * weights.preferenceWeight +
        qualityScore * weights.qualityWeight) /
      sumRemaining;
  } else {
    finalScore =
      semanticScore * weights.semanticWeight +
      coverageScore * weights.coverageWeight +
      careerScore * weights.careerWeight +
      difficultyScore * weights.difficultyWeight +
      prerequisiteScore * weights.prerequisiteWeight +
      preferenceScore * weights.preferenceWeight +
      qualityScore * weights.qualityWeight;
  }

  finalScore = Number(Math.max(0, Math.min(1, finalScore)).toFixed(4));
  const matchPercentage = Math.round(finalScore * 100);

  return {
    semanticScore,
    coverageScore,
    careerScore,
    difficultyScore,
    prerequisiteScore,
    preferenceScore,
    qualityScore,
    finalScore,
    matchPercentage,
    isSemanticFallback,
  };
}

/**
 * Generates transparent explainability bullet points based on calculated component scores.
 */
export function generateExplanations(
  resource: LearningResource,
  targetGap: SkillGapItem,
  careerName: string,
  scores: RecommendationScoreBreakdown,
  learnerPreference?: LearningPreference | null
): string[] {
  const reasons: string[] = [];

  // Coverage reason
  const mapping = resource.skills?.find(
    s =>
      s.skillId === targetGap.skillId ||
      s.skillSlug === targetGap.skillSlug ||
      s.skillName?.toLowerCase() === targetGap.skillName.toLowerCase()
  );

  if (mapping?.coverage === 'PRIMARY') {
    reasons.push(`Directly teaches ${targetGap.skillName} (Primary core focus)`);
  } else if (mapping?.coverage === 'SUPPORTING') {
    reasons.push(`Covers ${targetGap.skillName} as a key supporting competency`);
  } else {
    reasons.push(`Reinforces foundational skills supporting ${targetGap.skillName}`);
  }

  // Difficulty reason
  if (scores.difficultyScore >= 0.8) {
    reasons.push(
      `Calibrated for your level (${resource.difficulty.toLowerCase()} difficulty match)`
    );
  } else if (scores.difficultyScore < 0.4) {
    reasons.push(`Note: Advanced curriculum requiring solid foundational footing`);
  }

  // Career reason
  if (targetGap.importance === 'CORE') {
    reasons.push(`Core non-negotiable requirement for ${careerName}`);
  } else if (targetGap.importance === 'HIGH') {
    reasons.push(`High-demand industry requirement for ${careerName}`);
  }

  // Prerequisite reason
  if (scores.prerequisiteScore >= 0.8) {
    reasons.push(`Prerequisites satisfied for smooth learning progression`);
  } else {
    reasons.push(`Prerequisite advisory: Consider completing foundational gaps first`);
  }

  // Preference reason
  if (scores.preferenceScore >= 0.75 && learnerPreference?.learningFormat) {
    reasons.push(
      `${resource.resourceType.toLowerCase()} format aligns with your preferred learning style`
    );
  }

  return reasons;
}

/**
 * Diversity re-ranking: penalizes near-duplicate resource types within top ranks.
 */
export function applyDiversityReranking(items: RecommendationItem[], topK = 4): RecommendationItem[] {
  if (items.length <= 1) return items;

  const result: RecommendationItem[] = [];
  const remaining = [...items];
  const typeCounts: Record<string, number> = {};

  while (remaining.length > 0 && result.length < topK) {
    let bestIdx = 0;
    let bestAdjustedScore = -1;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      if (!candidate) continue;
      const type = candidate.resource.resourceType;
      const count = typeCounts[type] || 0;
      // Mild penalty for duplicate format in top 3
      const diversityPenalty = count * 0.04;
      const adjustedScore = candidate.scoreBreakdown.finalScore - diversityPenalty;

      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIdx = i;
      }
    }

    const selected = remaining.splice(bestIdx, 1)[0];
    if (selected) {
      const type = selected.resource.resourceType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      selected.rank = result.length + 1;
      result.push(selected);
    }
  }

  return result;
}

/**
 * Main function to rank candidate resources for a list of prioritized skill gaps.
 */
export function rankRecommendationsForGaps(params: {
  gaps: SkillGapItem[];
  resources: LearningResource[];
  careerName: string;
  careerId: string;
  careerSlug: string;
  learnerProfile: LearnerProfile;
  learnerPreference?: LearningPreference | null;
  maxPerGap?: number;
  minScore?: number;
  isSemanticFallback?: boolean;
  weights?: RecommendationWeights;
}): SkillGapRecommendationGroup[] {
  const {
    gaps,
    resources,
    careerName,
    learnerProfile,
    learnerPreference,
    maxPerGap = 4,
    minScore = MIN_RECOMMENDATION_SCORE_THRESHOLD,
    isSemanticFallback = false,
    weights = DEFAULT_RECOMMENDATION_WEIGHTS,
  } = params;

  const groups: SkillGapRecommendationGroup[] = [];

  // Process each prioritized skill gap
  for (const gap of gaps) {
    // Only recommend for skills with an actual gap (gap > 0)
    if (gap.gap <= 0) continue;

    // Build query context embedding
    const queryText = buildQueryEmbeddingText({
      careerName,
      targetSkillName: gap.skillName,
      learnerLevel: gap.learnerLevel,
      learningStyle: learnerPreference?.learningFormat,
      interests: learnerProfile.interests?.map(i => i.topic),
    });
    const queryEmbedding = generateTextEmbedding(queryText);

    // Retrieve and score candidate resources
    const candidateItems: RecommendationItem[] = [];

    for (const res of resources) {
      if (!res.isActive) continue;

      const scoreBreakdown = scoreResource({
        resource: res,
        targetGap: gap,
        careerName,
        careerImportance: gap.importance as CareerImportance,
        learnerProfile,
        learnerPreference,
        queryEmbedding,
        weights,
        isSemanticFallback,
      });

      // Filter by minimum score threshold
      if (scoreBreakdown.finalScore >= minScore) {
        const explanations = generateExplanations(
          res,
          gap,
          careerName,
          scoreBreakdown,
          learnerPreference
        );

        candidateItems.push({
          resourceId: res.id,
          resource: res,
          targetSkillId: gap.skillId,
          targetSkillName: gap.skillName,
          targetSkillSlug: gap.skillSlug,
          rank: 0,
          scoreBreakdown,
          explanation: explanations,
          algorithmVersion: 'recommendation-v1',
        });
      }
    }

    // Sort by final score descending
    candidateItems.sort((a, b) => b.scoreBreakdown.finalScore - a.scoreBreakdown.finalScore);

    // Apply diversity re-ranking
    const topRanked = applyDiversityReranking(candidateItems, maxPerGap);

    groups.push({
      skillId: gap.skillId,
      skillName: gap.skillName,
      skillSlug: gap.skillSlug,
      importance: gap.importance as CareerImportance,
      learnerLevel: gap.learnerLevel,
      requiredLevel: gap.requiredLevel,
      gap: gap.gap,
      isCritical: gap.isCritical,
      readiness: gap.readiness,
      recommendations: topRanked,
    });
  }

  return groups;
}
