import type {
  SkillEvidenceItem,
  SkillStateItem,
  SkillStatus,
  EvidenceType,
} from '../types/evidence.js';

export interface EvidenceWeightConfig {
  weight: number;
  baseConfidence: number;
}

export const EVIDENCE_WEIGHT_CONFIG: Record<EvidenceType, EvidenceWeightConfig> = {
  SELF_REPORTED: { weight: 0.2, baseConfidence: 0.35 },
  RESOURCE_COMPLETION: { weight: 0.3, baseConfidence: 0.55 },
  PROJECT: { weight: 0.7, baseConfidence: 0.8 },
  ASSESSMENT: { weight: 0.85, baseConfidence: 0.9 },
  USER_FEEDBACK: { weight: 0.15, baseConfidence: 0.4 },
};

/**
 * Maps a continuous 0-100 score to discrete 1-5 proficiency level.
 */
export function scoreToProficiencyLevel(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

/**
 * Maps a 1-5 discrete proficiency level to a baseline percentage score.
 */
export function levelToBaselineScore(level: number): number {
  switch (level) {
    case 5:
      return 95;
    case 4:
      return 80;
    case 3:
      return 65;
    case 2:
      return 45;
    default:
      return 25;
  }
}

export interface InferSkillParams {
  skillId: string;
  skillName: string;
  skillSlug: string;
  learnerProfileId: string;
  selfReportedLevel: number; // 1 to 5 (from original profile)
  targetLevel: number; // 1 to 5 (from career requirement)
  evidenceList: SkillEvidenceItem[];
}

/**
 * Deterministically infers a learner's skill proficiency level and confidence
 * by combining their preserved self-report with observed/measured evidence.
 */
export function inferSkillState(params: InferSkillParams): SkillStateItem {
  const {
    skillId,
    skillName,
    skillSlug,
    learnerProfileId,
    selfReportedLevel,
    targetLevel,
    evidenceList = [],
  } = params;

  // 1. If no observed evidence exists, infer purely from self-report with low confidence
  if (evidenceList.length === 0) {
    const baselineScore = levelToBaselineScore(selfReportedLevel);
    const selfConfidence = 0.35;
    const inferredLevel = selfReportedLevel;
    const gap = Math.max(0, targetLevel - inferredLevel);

    let status: SkillStatus = 'NEEDS_WORK';
    if (inferredLevel >= targetLevel && inferredLevel === 5) status = 'MASTERED';
    else if (inferredLevel >= targetLevel) status = 'SATISFIED';
    else if (inferredLevel >= 2) status = 'DEVELOPING';

    return {
      learnerProfileId,
      skillId,
      skillName,
      skillSlug,
      inferredLevel,
      confidence: selfConfidence,
      evidenceScore: baselineScore,
      status,
      selfReportedLevel,
      targetLevel,
      gap,
      lastAssessedAt: null,
      evidenceCount: 0,
    };
  }

  // 2. Aggregate self-report as a baseline evidence item
  let totalWeightedScore = levelToBaselineScore(selfReportedLevel) * EVIDENCE_WEIGHT_CONFIG.SELF_REPORTED.weight;
  let totalWeight = EVIDENCE_WEIGHT_CONFIG.SELF_REPORTED.weight;

  let lastAssessedAt: Date | null = null;
  let maxConfidence = EVIDENCE_WEIGHT_CONFIG.SELF_REPORTED.baseConfidence;

  // 3. Process each measured evidence entry
  for (const ev of evidenceList) {
    const config = EVIDENCE_WEIGHT_CONFIG[ev.evidenceType] || { weight: 0.3, baseConfidence: 0.5 };
    const evWeight = config.weight;
    const evScore = Math.max(0, Math.min(100, ev.score));

    totalWeightedScore += evScore * evWeight;
    totalWeight += evWeight;

    if (ev.confidence > maxConfidence) {
      maxConfidence = ev.confidence;
    }

    if (ev.evidenceType === 'ASSESSMENT') {
      if (!lastAssessedAt || new Date(ev.createdAt) > new Date(lastAssessedAt)) {
        lastAssessedAt = new Date(ev.createdAt);
      }
    }
  }

  const aggregatedScore = Math.round(totalWeightedScore / totalWeight);
  const inferredLevel = scoreToProficiencyLevel(aggregatedScore);

  // Scale confidence based on evidence count and high-weight assessments
  const hasAssessment = evidenceList.some(e => e.evidenceType === 'ASSESSMENT');
  const hasProject = evidenceList.some(e => e.evidenceType === 'PROJECT');

  let finalConfidence = Math.min(0.95, maxConfidence + (evidenceList.length > 2 ? 0.05 : 0.0));
  if (hasAssessment && hasProject) {
    finalConfidence = Math.max(0.85, finalConfidence);
  } else if (hasAssessment) {
    finalConfidence = Math.max(0.8, finalConfidence);
  }

  // Round confidence to 2 decimals
  finalConfidence = Math.round(finalConfidence * 100) / 100;

  const gap = Math.max(0, targetLevel - inferredLevel);

  let status: SkillStatus = 'NEEDS_WORK';
  if (inferredLevel >= targetLevel && inferredLevel === 5) status = 'MASTERED';
  else if (inferredLevel >= targetLevel) status = 'SATISFIED';
  else if (inferredLevel >= 2) status = 'DEVELOPING';

  return {
    learnerProfileId,
    skillId,
    skillName,
    skillSlug,
    inferredLevel,
    confidence: finalConfidence,
    evidenceScore: aggregatedScore,
    status,
    selfReportedLevel,
    targetLevel,
    gap,
    lastAssessedAt,
    evidenceCount: evidenceList.length,
    evidenceHistory: evidenceList,
  };
}
