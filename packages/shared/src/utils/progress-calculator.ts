import type {
  MilestoneProgressItem,
  MilestoneProgressStatus,
  PathProgressReport,
  ResourceProgressItem,
} from '../types/progress.js';
import type { LearningMilestoneItem } from '../types/learning-path.js';

export interface MilestoneProgressInput {
  milestone: LearningMilestoneItem;
  resourceProgressMap: Map<string, ResourceProgressItem>;
  previousMilestoneCompleted: boolean;
}

/**
 * Calculates deterministic milestone progress weighted by resource study hours.
 */
export function calculateMilestoneProgress(input: MilestoneProgressInput): MilestoneProgressItem {
  const { milestone, resourceProgressMap, previousMilestoneCompleted } = input;

  const resources = milestone.resources || [];
  const totalResourceCount = resources.length;

  if (totalResourceCount === 0) {
    const isCompleted = milestone.status === 'COMPLETED';
    return {
      milestoneId: milestone.id || `m-${milestone.order}`,
      title: milestone.title,
      order: milestone.order,
      status: isCompleted
        ? 'COMPLETED'
        : previousMilestoneCompleted
        ? 'AVAILABLE'
        : 'LOCKED',
      progressPercent: isCompleted ? 100 : 0,
      completedResourceCount: 0,
      totalResourceCount: 0,
      completedHours: isCompleted ? milestone.estimatedHours : 0,
      totalHours: milestone.estimatedHours,
      isUnlocked: previousMilestoneCompleted,
    };
  }

  let totalEstimatedHours = 0;
  let totalWeightedCompletedHours = 0;
  let completedResourceCount = 0;
  let inProgressResourceCount = 0;

  for (const r of resources) {
    const resHours = r.estimatedHours || 5;
    totalEstimatedHours += resHours;

    const prog = resourceProgressMap.get(r.resourceId);
    if (prog) {
      const pct = Math.max(0, Math.min(100, prog.progressPercent || 0));
      totalWeightedCompletedHours += (pct / 100) * resHours;

      if (prog.status === 'COMPLETED' || pct === 100) {
        completedResourceCount++;
      } else if (pct > 0 || prog.status === 'IN_PROGRESS') {
        inProgressResourceCount++;
      }
    }
  }

  const progressPercent =
    totalEstimatedHours > 0
      ? Math.round((totalWeightedCompletedHours / totalEstimatedHours) * 100)
      : 0;

  let status: MilestoneProgressStatus = 'LOCKED';
  if (progressPercent >= 100 || completedResourceCount === totalResourceCount) {
    status = 'COMPLETED';
  } else if (!previousMilestoneCompleted && milestone.order > 1) {
    status = 'LOCKED';
  } else if (progressPercent > 0 || inProgressResourceCount > 0) {
    status = 'IN_PROGRESS';
  } else {
    status = 'AVAILABLE';
  }

  return {
    milestoneId: milestone.id || `m-${milestone.order}`,
    title: milestone.title,
    order: milestone.order,
    status,
    progressPercent,
    completedResourceCount,
    totalResourceCount,
    completedHours: Math.round(totalWeightedCompletedHours * 10) / 10,
    totalHours: totalEstimatedHours,
    isUnlocked: previousMilestoneCompleted || milestone.order === 1,
  };
}

export interface CalculatePathProgressParams {
  pathId: string;
  careerId: string;
  careerName: string;
  milestones: LearningMilestoneItem[];
  resourceProgressList: ResourceProgressItem[];
}

/**
 * Calculates overall weighted path progress across all milestones.
 */
export function calculatePathProgress(params: CalculatePathProgressParams): PathProgressReport {
  const { pathId, careerId, careerName, milestones = [], resourceProgressList = [] } = params;

  const resourceProgressMap = new Map<string, ResourceProgressItem>();
  for (const rp of resourceProgressList) {
    resourceProgressMap.set(rp.resourceId, rp);
  }

  const milestoneProgressItems: MilestoneProgressItem[] = [];
  let prevCompleted = true; // Milestone 1 is always unlocked

  let pathTotalHours = 0;
  let pathCompletedHours = 0;
  let completedMilestones = 0;

  for (const m of milestones) {
    const item = calculateMilestoneProgress({
      milestone: m,
      resourceProgressMap,
      previousMilestoneCompleted: prevCompleted,
    });

    milestoneProgressItems.push(item);
    pathTotalHours += item.totalHours;
    pathCompletedHours += item.completedHours;

    if (item.status === 'COMPLETED') {
      completedMilestones++;
      prevCompleted = true;
    } else {
      prevCompleted = false;
    }
  }

  const overallProgressPercent =
    pathTotalHours > 0 ? Math.round((pathCompletedHours / pathTotalHours) * 100) : 0;

  return {
    pathId,
    careerId,
    careerName,
    overallProgressPercent,
    completedHours: Math.round(pathCompletedHours * 10) / 10,
    totalHours: pathTotalHours,
    completedMilestones,
    totalMilestones: milestones.length,
    milestones: milestoneProgressItems,
  };
}
