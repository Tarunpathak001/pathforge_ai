import type { CareerImportance } from './career.js';
import type { PrerequisiteReadiness } from './skill-gap.js';

export type ResourceType =
  | 'COURSE'
  | 'PROJECT'
  | 'ARTICLE'
  | 'DOCUMENTATION'
  | 'VIDEO'
  | 'BOOK'
  | 'EXERCISE';

export type ResourceDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type SkillCoverageLevel = 'PRIMARY' | 'SUPPORTING' | 'MENTIONED';

export interface ResourceSkill {
  id?: string;
  resourceId?: string;
  skillId: string;
  skillName?: string;
  skillSlug?: string;
  coverage: SkillCoverageLevel;
}

export interface ResourcePrerequisite {
  id?: string;
  resourceId?: string;
  skillId: string;
  skillName?: string;
  skillSlug?: string;
  requiredLevel: number;
}

export interface LearningResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  resourceType: ResourceType;
  provider: string;
  url: string;
  difficulty: ResourceDifficulty;
  estimatedHours: number;
  language: string;
  isFree: boolean;
  qualityScore: number; // 0.0 to 1.0 internal curated quality score
  embedding?: number[] | string | null;
  isActive: boolean;
  skills: ResourceSkill[];
  prerequisites?: ResourcePrerequisite[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RecommendationScoreBreakdown {
  semanticScore: number; // 0.0 to 1.0 (Cosine similarity with query context)
  coverageScore: number; // 0.0 to 1.0 (PRIMARY=1.0, SUPPORTING=0.6, MENTIONED=0.2)
  careerScore: number; // 0.0 to 1.0 (CORE=1.0, HIGH=0.8, MEDIUM=0.5, OPTIONAL=0.2)
  difficultyScore: number; // 0.0 to 1.0 (Fit with learner's current skill level)
  prerequisiteScore: number; // 0.0 to 1.0 (Resource & skill prerequisite readiness)
  preferenceScore: number; // 0.0 to 1.0 (Format match & weekly time commitment)
  qualityScore: number; // 0.0 to 1.0 (Internal curated benchmark)
  finalScore: number; // 0.0 to 1.0 (Weighted sum)
  matchPercentage: number; // 0 to 100 rounded
  isSemanticFallback: boolean;
}

export interface RecommendationItem {
  id?: string;
  resourceId: string;
  resource: LearningResource;
  targetSkillId: string;
  targetSkillName: string;
  targetSkillSlug: string;
  rank: number;
  scoreBreakdown: RecommendationScoreBreakdown;
  explanation: string[]; // Structured explainable bullet points
  algorithmVersion: string;
}

export interface SkillGapRecommendationGroup {
  skillId: string;
  skillName: string;
  skillSlug: string;
  importance: CareerImportance;
  learnerLevel: number;
  requiredLevel: number;
  gap: number;
  isCritical: boolean;
  readiness: PrerequisiteReadiness;
  recommendations: RecommendationItem[];
}

export interface RecommendationResponse {
  careerId: string;
  careerName: string;
  careerSlug: string;
  algorithmVersion: string;
  isSemanticFallback: boolean;
  totalRecommendations: number;
  groups: SkillGapRecommendationGroup[];
  generatedAt: Date | string;
}

export interface RecommendationWeights {
  semanticWeight: number; // default 0.30
  coverageWeight: number; // default 0.25
  careerWeight: number; // default 0.15
  difficultyWeight: number; // default 0.10
  prerequisiteWeight: number; // default 0.08
  preferenceWeight: number; // default 0.07
  qualityWeight: number; // default 0.05
}

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  semanticWeight: 0.3,
  coverageWeight: 0.25,
  careerWeight: 0.15,
  difficultyWeight: 0.1,
  prerequisiteWeight: 0.08,
  preferenceWeight: 0.07,
  qualityWeight: 0.05,
};

export const MIN_RECOMMENDATION_SCORE_THRESHOLD = 0.45;
