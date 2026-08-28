import type { NextAction } from '../types/adaptive.js';
import type { LearningMilestoneItem } from '../types/learning-path.js';
import type { MilestoneProgressItem, ResourceProgressItem } from '../types/progress.js';
import type { AssessmentItem } from '../types/assessment.js';
import type { SkillStateItem } from '../types/evidence.js';

export interface DetermineNextActionParams {
  careerName: string;
  milestones: LearningMilestoneItem[];
  milestoneProgressList: MilestoneProgressItem[];
  resourceProgressMap: Map<string, ResourceProgressItem>;
  availableAssessments: AssessmentItem[];
  skillStates: Map<string, SkillStateItem>;
}

/**
 * Deterministically determines the single highest-impact Next Best Action for the learner.
 */
export function determineNextAction(params: DetermineNextActionParams): NextAction | null {
  const {
    careerName,
    milestones = [],
    milestoneProgressList = [],
    resourceProgressMap,
    availableAssessments = [],
  } = params;

  if (milestones.length === 0) return null;

  // 1. Locate the earliest active milestone (IN_PROGRESS or AVAILABLE)
  let activeMilestone: LearningMilestoneItem | null = null;

  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    if (!m) continue;
    const prog = milestoneProgressList.find(p => p.order === m.order);
    if (prog && prog.status !== 'COMPLETED' && prog.status !== 'LOCKED') {
      activeMilestone = m;
      break;
    }
  }

  // If all milestones completed, return capstone review or completion state
  if (!activeMilestone) {
    const lastMilestone = milestones[milestones.length - 1];
    if (!lastMilestone) return null;
    return {
      type: 'PROJECT',
      id: lastMilestone.id || 'capstone',
      title: `Final Review: ${lastMilestone.title}`,
      subtitle: `Career Readiness for ${careerName}`,
      reason: `You have completed all roadmap milestones! Review and polish your portfolio project for recruiter inspection.`,
      estimatedMinutes: 60,
      skillName: careerName,
      skillId: 'career-capstone',
      actionUrl: '#learning-path',
      priority: 100,
    };
  }

  // 2. Inspect resources in the active milestone
  const resources = activeMilestone.resources || [];
  const primarySkill =
    activeMilestone.skills && activeMilestone.skills.length > 0 && activeMilestone.skills[0]
      ? activeMilestone.skills[0]
      : { skillId: 'active-skill', skillName: 'Core Competency', skillSlug: 'core' };

  // Check if there is an in-progress resource
  const inProgressRes = resources.find(r => {
    const p = resourceProgressMap.get(r.resourceId);
    return p && p.status === 'IN_PROGRESS' && p.progressPercent < 100;
  });

  if (inProgressRes) {
    const prog = resourceProgressMap.get(inProgressRes.resourceId)!;
    return {
      type: 'RESOURCE',
      id: inProgressRes.resourceId,
      title: `Continue: ${inProgressRes.resource.title}`,
      subtitle: `${inProgressRes.resource.provider} • ${prog.progressPercent}% Completed`,
      reason: `You have already started this ${inProgressRes.role.toLowerCase()} resource. Complete the remaining material to advance Milestone ${activeMilestone.order}.`,
      estimatedMinutes: Math.max(
        15,
        Math.round(inProgressRes.estimatedHours * 60 * (1 - prog.progressPercent / 100))
      ),
      skillName: primarySkill.skillName,
      skillId: primarySkill.skillId,
      actionUrl: inProgressRes.resource.url,
      priority: 95,
    };
  }

  // Check if there is an unstarted resource
  const unstartedRes = resources.find(r => {
    const p = resourceProgressMap.get(r.resourceId);
    return !p || (p.status !== 'COMPLETED' && p.progressPercent === 0);
  });

  if (unstartedRes) {
    return {
      type: 'RESOURCE',
      id: unstartedRes.resourceId,
      title: `Start: ${unstartedRes.resource.title}`,
      subtitle: `${unstartedRes.resource.provider} • ${unstartedRes.role}`,
      reason: `This ${unstartedRes.role.toLowerCase()} resource covers key competencies in ${primarySkill.skillName} for Milestone ${activeMilestone.order}.`,
      estimatedMinutes: Math.round(unstartedRes.estimatedHours * 60),
      skillName: primarySkill.skillName,
      skillId: primarySkill.skillId,
      actionUrl: unstartedRes.resource.url,
      priority: 90,
    };
  }

  // 3. If all resources in active milestone are done, check for an assessment to verify mastery
  const matchingAssessment = availableAssessments.find(a => {
    return a.skills.some(
      s => s.skillSlug === primarySkill.skillSlug || s.skillId === primarySkill.skillId
    );
  });

  if (matchingAssessment) {
    return {
      type: 'ASSESSMENT',
      id: matchingAssessment.id,
      title: `Take Assessment: ${matchingAssessment.title}`,
      subtitle: `${matchingAssessment.estimatedMinutes} mins • ${matchingAssessment.questionsCount || 5} Questions`,
      reason: `You finished the milestone resources for ${primarySkill.skillName}. Take this assessment to measure your competency and unlock downstream topics.`,
      estimatedMinutes: matchingAssessment.estimatedMinutes,
      skillName: primarySkill.skillName,
      skillId: primarySkill.skillId,
      actionUrl: `#assessments/${matchingAssessment.id}`,
      priority: 85,
    };
  }

  // 4. Fallback: Advance to Capstone / Milestone deliverable
  return {
    type: 'PROJECT',
    id: activeMilestone.id || `m-${activeMilestone.order}`,
    title: `Complete Deliverable: ${activeMilestone.title}`,
    subtitle: `Milestone ${activeMilestone.order} Completion Criteria`,
    reason: `Implement the milestone practical criteria to prove mastery before advancing to the next topic.`,
    estimatedMinutes: Math.round(activeMilestone.estimatedHours * 60),
    skillName: primarySkill.skillName,
    skillId: primarySkill.skillId,
    actionUrl: '#learning-path',
    priority: 80,
  };
}
