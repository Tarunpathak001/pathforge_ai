import type { NextAction, AdaptiveChangeSummary } from './adaptive.js';

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
}

export interface DashboardCareer {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
}

export interface DashboardCareerAlignment {
  score: number; // 0 to 100
  band: string; // 'Starting Point' | 'Early Development' | 'Developing' | 'Strong Progress' | 'Career Ready'
  delta: number; // e.g. +8
  deltaReason: string; // e.g. 'since your last assessment'
  strongCount: number;
  developingCount: number;
  gapCount: number;
  summary: string;
  explanation: string;
}

export interface DashboardMilestoneSkill {
  skillId: string;
  skillName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  isMastered: boolean;
}

export interface DashboardCurrentMilestone {
  id: string;
  title: string;
  description: string;
  order: number;
  progressPercent: number;
  completedHours: number;
  totalHours: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  skills: DashboardMilestoneSkill[];
}

export interface DashboardRoadmapMilestoneItem {
  id: string;
  title: string;
  order: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercent: number;
  estimatedHours: number;
}

export interface DashboardRoadmapPreview {
  pathId: string;
  title: string;
  overallProgressPercent: number;
  completedHours: number;
  totalHours: number;
  estimatedWeeks: number;
  weeklyHours: number;
  milestones: DashboardRoadmapMilestoneItem[];
}

export interface DashboardSkillSummaryItem {
  skillId: string;
  name: string;
  slug: string;
  level: number;
  targetLevel: number;
  gap: number;
  category: string;
  confidence: number;
  isCore?: boolean;
}

export interface DashboardSkillSummary {
  strong: DashboardSkillSummaryItem[];
  developing: DashboardSkillSummaryItem[];
  criticalGaps: DashboardSkillSummaryItem[];
}

export interface DashboardSkillProgressItem {
  skillId: string;
  skillName: string;
  skillSlug: string;
  fromLevel: number;
  toLevel: number;
  delta: number;
  confidence: number;
  evidenceType: string;
  updatedAt: Date;
}

export interface DashboardRecommendationItem {
  id: string;
  title: string;
  provider: string;
  url: string;
  difficulty: string;
  resourceType: string;
  estimatedHours: number;
  matchScore: number;
  qualityScore: number;
  primarySkillName: string;
}

export interface DashboardActivityItem {
  id: string;
  type:
    | 'RESOURCE_COMPLETED'
    | 'ASSESSMENT_COMPLETED'
    | 'SKILL_IMPROVED'
    | 'PATH_ADAPTED'
    | 'FEEDBACK_SUBMITTED';
  title: string;
  description: string;
  timestamp: Date;
}

export interface DashboardWeeklySummary {
  completedHours: number;
  targetWeeklyHours: number;
  completedResources: number;
  completedAssessments: number;
  skillsImproved: number;
}

export interface DashboardSummary {
  user: DashboardUser;
  career: DashboardCareer | null;
  alignment: DashboardCareerAlignment | null;
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
