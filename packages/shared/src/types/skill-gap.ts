import type { Career, CareerImportance } from './career.js';

export type SkillGapSeverity = 'NO_GAP' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type PrerequisiteReadiness = 'READY' | 'PARTIALLY_READY' | 'BLOCKED';

export type SkillGapCategory = 'STRENGTH' | 'DEVELOPING' | 'MISSING';

export type ReadinessBand =
  'Starting Point' | 'Early Development' | 'Developing' | 'Strong Progress' | 'Career Ready';

export interface PriorityWeights {
  gapSeverity: number;
  careerImportance: number;
  prerequisiteImpact: number;
  readiness: number;
}

export interface SkillPrerequisiteStatus {
  prerequisiteSkillId: string;
  prerequisiteSkillName: string;
  prerequisiteSlug: string;
  requiredLevel: number;
  learnerLevel: number;
  isMet: boolean;
  strength: string;
  rationale?: string | null;
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  skillSlug: string;
  categoryName: string;
  skillType: string;
  description?: string;
  aliases: string[];

  // Competency comparison
  learnerLevel: number; // 0 if missing, or 1 to 5
  requiredLevel: number; // 1 to 5 target benchmark
  gap: number; // max(0, requiredLevel - learnerLevel)
  gapSeverity: number; // 0.0 to 1.0 (normalized gap)
  severityCategory: SkillGapSeverity;

  // Career importance
  importance: CareerImportance | string;
  importanceWeight: number; // e.g. CORE=1.0, HIGH=0.8, MEDIUM=0.5, OPTIONAL=0.2
  careerPriorityRank: number;
  careerRationale?: string | null;
  isCore: boolean;

  // Prerequisite intelligence
  readiness: PrerequisiteReadiness;
  readinessScore: number; // 1.0=READY, 0.5=PARTIALLY_READY, 0.1=BLOCKED
  downstreamImpactCount: number; // Direct and indirect dependents in this career
  prerequisiteImpactScore: number; // 0.0 to 1.0 normalized graph influence
  prerequisites: SkillPrerequisiteStatus[];

  // Overall Priority & Classification
  priorityScore: number; // 0.0 to 1.0 (higher means address sooner)
  displayPriority: number; // 0 to 100
  category: SkillGapCategory; // STRENGTH, DEVELOPING, MISSING
  isCritical: boolean; // Flagged for immediate focus

  // Structured Explanation
  explanation: string;
}

export interface SkillGapSummary {
  totalRequiredSkills: number;
  strengthsCount: number;
  developingCount: number;
  missingCount: number;
  criticalGapsCount: number;
  readyToLearnCount: number;
}

export interface SkillGapAnalysisReport {
  id?: string;
  userId: string;
  learnerProfileId: string;
  career: Career;
  readinessScore: number; // 0 to 100 overall alignment percentage
  readinessBand: ReadinessBand;
  algorithmVersion: string; // e.g. 'v1'
  summaryText: string;
  stats: SkillGapSummary;

  // Grouped results
  strengths: SkillGapItem[];
  developingSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  criticalGaps: SkillGapItem[];
  actionQueue: SkillGapItem[]; // Sorted by priorityScore descending (top recommendation order)

  // Full item list
  allResults: SkillGapItem[];

  createdAt: Date | string;
}
