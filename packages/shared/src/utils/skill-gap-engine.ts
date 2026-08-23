import type { Career, CareerImportance } from '../types/career.js';
import type {
  SkillGapItem,
  SkillGapAnalysisReport,
  SkillGapSeverity,
  PrerequisiteReadiness,
  SkillGapCategory,
  ReadinessBand,
  PriorityWeights,
  SkillPrerequisiteStatus,
  SkillGapSummary,
} from '../types/skill-gap.js';
import { matchSkillToCanonical, type CanonicalSkillReference } from './skill-matcher.js';

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  gapSeverity: 0.4,
  careerImportance: 0.3,
  prerequisiteImpact: 0.2,
  readiness: 0.1,
};

export const CAREER_IMPORTANCE_WEIGHTS: Record<string, number> = {
  CORE: 1.0,
  HIGH: 0.8,
  MEDIUM: 0.5,
  OPTIONAL: 0.2,
};

export interface RawLearnerSkillInput {
  id?: string;
  name: string;
  normalizedName?: string;
  selfReportedLevel: number;
  evidence?: string | null;
}

export interface RawCareerSkillInput {
  id?: string;
  skillId: string;
  skill: {
    id: string;
    name: string;
    slug: string;
    category: string;
    aliases?: string | string[];
    skillType: string;
    description?: string;
  };
  importance: CareerImportance | string;
  requiredLevel: number;
  priority?: number;
  rationale?: string | null;
  isCore?: boolean;
}

export interface RawSkillPrerequisiteEdge {
  skillId: string;
  prerequisiteSkillId: string;
  strength?: string;
  rationale?: string | null;
}

export interface CalculateSkillGapParams {
  userId: string;
  learnerProfileId: string;
  career: Career;
  careerSkills: RawCareerSkillInput[];
  allPrerequisites: RawSkillPrerequisiteEdge[];
  learnerSkills: RawLearnerSkillInput[];
  priorityWeights?: PriorityWeights;
  algorithmVersion?: string;
}

/**
 * Deterministic, explainable Skill Gap Intelligence Engine.
 */
export function calculateSkillGap(params: CalculateSkillGapParams): SkillGapAnalysisReport {
  const {
    userId,
    learnerProfileId,
    career,
    careerSkills,
    allPrerequisites,
    learnerSkills,
    priorityWeights = DEFAULT_PRIORITY_WEIGHTS,
    algorithmVersion = 'v1',
  } = params;

  // Build canonical reference dictionary for career skills
  const canonicalSkillRefs: CanonicalSkillReference[] = careerSkills.map(cs => {
    let aliases: string[] = [];
    if (Array.isArray(cs.skill.aliases)) {
      aliases = cs.skill.aliases;
    } else if (typeof cs.skill.aliases === 'string') {
      try {
        aliases = JSON.parse(cs.skill.aliases);
      } catch {
        aliases = [];
      }
    }
    return {
      id: cs.skill.id,
      name: cs.skill.name,
      slug: cs.skill.slug,
      aliases,
    };
  });

  // Map learner skills to career skills
  const learnerSkillLevelBySkillId = new Map<string, number>();
  const matchedLearnerSkills = new Map<string, RawLearnerSkillInput>();

  for (const ls of learnerSkills) {
    const match = matchSkillToCanonical(ls, canonicalSkillRefs);
    if (match.matched && match.canonicalSkillId) {
      const rawLvl =
        ls.selfReportedLevel !== undefined && ls.selfReportedLevel !== null
          ? ls.selfReportedLevel
          : 3;
      const level = Math.max(0, Math.min(5, Math.round(rawLvl)));
      const existing = learnerSkillLevelBySkillId.get(match.canonicalSkillId);
      if (existing === undefined || level > existing) {
        learnerSkillLevelBySkillId.set(match.canonicalSkillId, level);
        matchedLearnerSkills.set(match.canonicalSkillId, ls);
      }
    }
  }

  // Precompute prerequisite graph lookups
  // Direct prerequisites for each skill: skillId -> [prerequisiteSkillId]
  const directPrereqsMap = new Map<string, RawSkillPrerequisiteEdge[]>();
  // Direct dependents for each skill: prerequisiteSkillId -> [skillId]
  const directDependentsMap = new Map<string, RawSkillPrerequisiteEdge[]>();

  for (const edge of allPrerequisites) {
    if (!directPrereqsMap.has(edge.skillId)) {
      directPrereqsMap.set(edge.skillId, []);
    }
    directPrereqsMap.get(edge.skillId)!.push(edge);

    if (!directDependentsMap.has(edge.prerequisiteSkillId)) {
      directDependentsMap.set(edge.prerequisiteSkillId, []);
    }
    directDependentsMap.get(edge.prerequisiteSkillId)!.push(edge);
  }

  // Skill lookup by ID in career
  const careerSkillIds = new Set(careerSkills.map(cs => cs.skill.id));
  const careerSkillMap = new Map(careerSkills.map(cs => [cs.skill.id, cs]));

  // Calculate downstream influence count within career requirements
  const downstreamImpactMap = new Map<string, number>();
  for (const cs of careerSkills) {
    const sid = cs.skill.id;
    const visited = new Set<string>();
    const queue = [...(directDependentsMap.get(sid) || []).map(e => e.skillId)];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (!visited.has(curr)) {
        visited.add(curr);
        const nextDeps = directDependentsMap.get(curr) || [];
        for (const dep of nextDeps) {
          if (!visited.has(dep.skillId)) {
            queue.push(dep.skillId);
          }
        }
      }
    }

    // Count how many visited downstream skills are required by this career
    let careerDependentsCount = 0;
    for (const downstreamId of visited) {
      if (careerSkillIds.has(downstreamId)) {
        careerDependentsCount++;
      }
    }
    downstreamImpactMap.set(sid, careerDependentsCount);
  }

  // Process all career skills
  const evaluatedItems: SkillGapItem[] = [];
  let totalWeightedAchievement = 0;
  let totalImportanceWeight = 0;

  for (const cs of careerSkills) {
    const skill = cs.skill;
    const requiredLevel = Math.max(1, Math.min(5, cs.requiredLevel || 3));
    const learnerLevel = learnerSkillLevelBySkillId.get(skill.id) || 0;
    const rawGap = Math.max(0, requiredLevel - learnerLevel);
    const gapSeverity = requiredLevel > 0 ? rawGap / requiredLevel : 0;

    // Severity category
    let severityCategory: SkillGapSeverity = 'NO_GAP';
    if (rawGap >= 4) severityCategory = 'CRITICAL';
    else if (rawGap === 3) severityCategory = 'HIGH';
    else if (rawGap === 2) severityCategory = 'MODERATE';
    else if (rawGap === 1) severityCategory = 'LOW';

    const impUpper = (cs.importance || 'HIGH').toString().toUpperCase();
    const importanceWeight = CAREER_IMPORTANCE_WEIGHTS[impUpper] ?? 0.5;

    // Readiness evaluation from prerequisites
    const prereqEdges = directPrereqsMap.get(skill.id) || [];
    const prereqStatuses: SkillPrerequisiteStatus[] = [];
    let metPrereqCount = 0;
    let totalPrereqCount = prereqEdges.length;

    for (const edge of prereqEdges) {
      const prereqSkill = careerSkillMap.get(edge.prerequisiteSkillId)?.skill;
      const pLevel = learnerSkillLevelBySkillId.get(edge.prerequisiteSkillId) || 0;
      const pRequired = careerSkillMap.get(edge.prerequisiteSkillId)?.requiredLevel || 2;
      const isMet = pLevel >= Math.min(2, pRequired);

      if (isMet) {
        metPrereqCount++;
      }

      prereqStatuses.push({
        prerequisiteSkillId: edge.prerequisiteSkillId,
        prerequisiteSkillName: prereqSkill ? prereqSkill.name : 'Foundational Skill',
        prerequisiteSlug: prereqSkill ? prereqSkill.slug : 'prereq',
        requiredLevel: pRequired,
        learnerLevel: pLevel,
        isMet,
        strength: edge.strength || 'REQUIRED',
        rationale: edge.rationale,
      });
    }

    let readiness: PrerequisiteReadiness = 'READY';
    let readinessScore = 1.0;

    if (totalPrereqCount > 0) {
      if (metPrereqCount === totalPrereqCount) {
        readiness = 'READY';
        readinessScore = 1.0;
      } else if (metPrereqCount > 0) {
        readiness = 'PARTIALLY_READY';
        readinessScore = 0.5;
      } else {
        readiness = 'BLOCKED';
        readinessScore = 0.1;
      }
    }

    // Downstream influence
    const downstreamImpactCount = downstreamImpactMap.get(skill.id) || 0;
    // Normalize impact score (e.g. 0 to 4 downstream dependents map to 0.0 to 1.0)
    const prerequisiteImpactScore = Math.min(1.0, downstreamImpactCount / 3.0);

    // Priority Score formula
    let priorityScore = 0;
    if (rawGap > 0) {
      priorityScore =
        gapSeverity * priorityWeights.gapSeverity +
        importanceWeight * priorityWeights.careerImportance +
        prerequisiteImpactScore * priorityWeights.prerequisiteImpact +
        readinessScore * priorityWeights.readiness;
      priorityScore = Math.max(0.0, Math.min(1.0, priorityScore));
    }

    const displayPriority = Math.round(priorityScore * 100);

    // Category classification
    let category: SkillGapCategory = 'MISSING';
    if (learnerLevel >= requiredLevel) {
      category = 'STRENGTH';
    } else if (learnerLevel > 0) {
      category = 'DEVELOPING';
    } else {
      category = 'MISSING';
    }

    // Critical Gap Flag
    const isCritical =
      (impUpper === 'CORE' && rawGap >= 2) ||
      (impUpper === 'HIGH' && rawGap >= 3) ||
      (rawGap >= 1 && priorityScore >= 0.7);

    // Parse aliases
    let aliasesList: string[] = [];
    if (Array.isArray(skill.aliases)) {
      aliasesList = skill.aliases;
    } else if (typeof skill.aliases === 'string') {
      try {
        aliasesList = JSON.parse(skill.aliases);
      } catch {
        aliasesList = [];
      }
    }

    // Deterministic explanation generator
    const explanation = generateStructuredExplanation({
      skillName: skill.name,
      learnerLevel,
      requiredLevel,
      rawGap,
      importance: impUpper,
      readiness,
      downstreamCount: downstreamImpactCount,
      prerequisites: prereqStatuses,
      careerRationale: cs.rationale,
    });

    // Achievement for overall career alignment
    const skillAchievement = Math.min(learnerLevel / requiredLevel, 1.0);
    totalWeightedAchievement += skillAchievement * importanceWeight;
    totalImportanceWeight += importanceWeight;

    evaluatedItems.push({
      skillId: skill.id,
      skillName: skill.name,
      skillSlug: skill.slug,
      categoryName: skill.category,
      skillType: skill.skillType,
      description: skill.description,
      aliases: aliasesList,
      learnerLevel,
      requiredLevel,
      gap: rawGap,
      gapSeverity,
      severityCategory,
      importance: impUpper,
      importanceWeight,
      careerPriorityRank: cs.priority || 1,
      careerRationale: cs.rationale,
      isCore: cs.isCore || impUpper === 'CORE',
      readiness,
      readinessScore,
      downstreamImpactCount,
      prerequisiteImpactScore,
      prerequisites: prereqStatuses,
      priorityScore,
      displayPriority,
      category,
      isCritical,
      explanation,
    });
  }

  // Calculate Overall Career Alignment Score (0 to 100)
  const overallReadiness =
    totalImportanceWeight > 0 ? (totalWeightedAchievement / totalImportanceWeight) * 100 : 0;
  const roundedReadiness = Math.round(overallReadiness);

  // Determine qualitative readiness band
  let readinessBand: ReadinessBand = 'Starting Point';
  if (roundedReadiness >= 86) readinessBand = 'Career Ready';
  else if (roundedReadiness >= 71) readinessBand = 'Strong Progress';
  else if (roundedReadiness >= 51) readinessBand = 'Developing';
  else if (roundedReadiness >= 31) readinessBand = 'Early Development';
  else readinessBand = 'Starting Point';

  // Group items
  const strengths = evaluatedItems.filter(i => i.category === 'STRENGTH');
  const developingSkills = evaluatedItems.filter(i => i.category === 'DEVELOPING');
  const missingSkills = evaluatedItems.filter(i => i.category === 'MISSING');
  const criticalGaps = evaluatedItems.filter(i => i.isCritical);

  // Action Queue: sorted by priorityScore descending, then by careerPriorityRank ascending
  const actionQueue = [...evaluatedItems]
    .filter(i => i.gap > 0)
    .sort((a, b) => {
      if (Math.abs(b.priorityScore - a.priorityScore) > 0.001) {
        return b.priorityScore - a.priorityScore;
      }
      return a.careerPriorityRank - b.careerPriorityRank;
    });

  const stats: SkillGapSummary = {
    totalRequiredSkills: evaluatedItems.length,
    strengthsCount: strengths.length,
    developingCount: developingSkills.length,
    missingCount: missingSkills.length,
    criticalGapsCount: criticalGaps.length,
    readyToLearnCount: actionQueue.filter(i => i.readiness === 'READY').length,
  };

  const summaryText = `Your skills currently align with ${roundedReadiness}% of the modeled requirements for ${career.name}. You have ${strengths.length} core strengths, ${developingSkills.length} developing skills, and ${criticalGaps.length} critical focus areas.`;

  return {
    userId,
    learnerProfileId,
    career,
    readinessScore: roundedReadiness,
    readinessBand,
    algorithmVersion,
    summaryText,
    stats,
    strengths,
    developingSkills,
    missingSkills,
    criticalGaps,
    actionQueue,
    allResults: evaluatedItems,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generates transparent, deterministic natural explanations from structured data.
 */
function generateStructuredExplanation(data: {
  skillName: string;
  learnerLevel: number;
  requiredLevel: number;
  rawGap: number;
  importance: string;
  readiness: PrerequisiteReadiness;
  downstreamCount: number;
  prerequisites: SkillPrerequisiteStatus[];
  careerRationale?: string | null;
}): string {
  const {
    skillName,
    learnerLevel,
    requiredLevel,
    rawGap,
    importance,
    readiness,
    downstreamCount,
    prerequisites,
    careerRationale,
  } = data;

  if (rawGap === 0) {
    return `Your level (${learnerLevel}/5) meets or exceeds the required level (${requiredLevel}/5) for ${importance.toLowerCase()} competencies in this role.`;
  }

  const parts: string[] = [];

  // 1. Discrepancy
  if (learnerLevel === 0) {
    parts.push(
      `You currently have no recorded experience in ${skillName}, while this career requires level ${requiredLevel}/5.`
    );
  } else {
    parts.push(
      `Your current proficiency is level ${learnerLevel}/5, leaving a gap of ${rawGap} level${rawGap > 1 ? 's' : ''} to meet the career requirement of ${requiredLevel}/5.`
    );
  }

  // 2. Career Importance
  if (careerRationale) {
    parts.push(careerRationale);
  } else if (importance === 'CORE') {
    parts.push(`${skillName} is a foundational CORE requirement for day-to-day role execution.`);
  } else if (importance === 'HIGH') {
    parts.push(
      `${skillName} is a HIGH priority capability strongly expected in modern engineering teams.`
    );
  }

  // 3. Prerequisite Readiness & Downstream Impact
  if (readiness === 'BLOCKED') {
    const missing = prerequisites.filter(p => !p.isMet).map(p => p.prerequisiteSkillName);
    parts.push(
      `Prerequisite check: This skill is currently BLOCKED. You should first develop foundational prerequisites: ${missing.join(', ')}.`
    );
  } else if (readiness === 'PARTIALLY_READY') {
    parts.push(`Prerequisite check: Partially ready. Some foundational concepts are in progress.`);
  } else if (readiness === 'READY') {
    parts.push(`Prerequisite check: READY. All foundational prerequisites are satisfied.`);
  }

  if (downstreamCount > 0) {
    parts.push(
      `Learning this skill directly unlocks ${downstreamCount} downstream advanced technical requirement${downstreamCount > 1 ? 's' : ''}.`
    );
  }

  return parts.join(' ');
}
