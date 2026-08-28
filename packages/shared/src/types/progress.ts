export type ResourceProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
export type MilestoneProgressStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

export interface ResourceProgressItem {
  id?: string;
  learnerProfileId: string;
  resourceId: string;
  status: ResourceProgressStatus;
  progressPercent: number; // 0 to 100
  startedAt?: Date | null;
  completedAt?: Date | null;
  timeSpentMinutes?: number;
  lastAccessedAt?: Date;
}

export interface MilestoneProgressItem {
  milestoneId: string;
  title: string;
  order: number;
  status: MilestoneProgressStatus;
  progressPercent: number; // 0 to 100
  completedResourceCount: number;
  totalResourceCount: number;
  completedHours: number;
  totalHours: number;
  isUnlocked: boolean;
}

export interface PathProgressReport {
  pathId: string;
  careerId: string;
  careerName: string;
  overallProgressPercent: number; // 0 to 100
  completedHours: number;
  totalHours: number;
  completedMilestones: number;
  totalMilestones: number;
  milestones: MilestoneProgressItem[];
}
