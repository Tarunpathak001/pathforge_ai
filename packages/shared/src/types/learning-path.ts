import type { LearningResource } from './recommendation.js';

export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type PathStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
export type MilestoneResourceRole = 'PRIMARY' | 'SUPPORTING' | 'PRACTICE' | 'PROJECT';

export interface MilestoneSkillItem {
  skillId: string;
  skillName: string;
  skillSlug: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  order: number;
  importance?: string;
  category?: string;
}

export interface MilestoneResourceItem {
  id?: string;
  resourceId: string;
  resource: LearningResource;
  order: number;
  role: MilestoneResourceRole;
  estimatedHours: number;
}

export interface LearningMilestoneItem {
  id?: string;
  title: string;
  description: string;
  order: number; // 1, 2, 3...
  estimatedHours: number;
  estimatedWeeks: number;
  learningObjectives: string[];
  completionCriteria: string[];
  whyThisOrder: string;
  status: MilestoneStatus;
  skills: MilestoneSkillItem[];
  resources: MilestoneResourceItem[];
}

export interface LearningPathReport {
  id?: string;
  userId: string;
  learnerProfileId: string;
  careerId: string;
  careerName: string;
  careerSlug: string;
  title: string;
  description: string;
  readinessAtGeneration: number; // 0 to 100 percentage
  estimatedHours: number;
  estimatedWeeks: number;
  weeklyHours: number;
  status: PathStatus;
  algorithmVersion: string;
  whyThisOrderOverview?: string[];
  milestones: LearningMilestoneItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GenerateLearningPathInput {
  careerId?: string;
  careerSlug?: string;
  weeklyHours?: number;
  regenerate?: boolean;
}

export interface LearningPathValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
