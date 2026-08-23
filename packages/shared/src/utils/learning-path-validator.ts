import type {
  LearningPathReport,
  LearningPathValidationResult,
} from '../types/learning-path.js';
import type { GraphPrerequisiteEdge } from './learning-path-generator.js';

export interface ValidatePathOptions {
  prerequisites: GraphPrerequisiteEdge[];
  learnerSkills?: Array<{
    name: string;
    normalizedName?: string;
    selfReportedLevel: number;
  }>;
}

/**
 * Validates a generated learning path against the 10 Quality Rules.
 */
export function validateLearningPath(
  path: LearningPathReport,
  options: ValidatePathOptions
): LearningPathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { prerequisites, learnerSkills = [] } = options;

  const learnerLevels = new Map<string, number>();
  for (const s of learnerSkills) {
    const key = (s.normalizedName || s.name).toLowerCase().replace(/\s+/g, '-');
    learnerLevels.set(key, s.selfReportedLevel);
  }

  if (!path.milestones || path.milestones.length === 0) {
    errors.push('Learning path must contain at least one milestone.');
    return { isValid: false, errors, warnings };
  }

  if (path.weeklyHours <= 0) {
    errors.push(`Invalid weeklyHours: ${path.weeklyHours}. Must be greater than zero.`);
  }

  if (path.estimatedHours <= 0) {
    errors.push(`Invalid estimatedHours: ${path.estimatedHours}. Must be greater than zero.`);
  }

  const skillOrderMap = new Map<string, number>();
  const allSeenSkillSlugs = new Set<string>();

  for (let i = 0; i < path.milestones.length; i++) {
    const milestone = path.milestones[i];
    if (!milestone) continue;

    if (milestone.order !== i + 1) {
      errors.push(`Milestone '${milestone.title}' has order ${milestone.order}, expected ${i + 1}.`);
    }

    if (!milestone.learningObjectives || milestone.learningObjectives.length === 0) {
      errors.push(`Milestone '${milestone.title}' is missing learning objectives.`);
    }

    if (!milestone.completionCriteria || milestone.completionCriteria.length === 0) {
      errors.push(`Milestone '${milestone.title}' is missing completion criteria.`);
    }

    const expectedWeeks = Math.max(1, Math.ceil(milestone.estimatedHours / path.weeklyHours));
    if (Math.abs(milestone.estimatedWeeks - expectedWeeks) > 1) {
      warnings.push(
        `Milestone '${milestone.title}' estimatedWeeks (${milestone.estimatedWeeks}) does not align with workload (${milestone.estimatedHours}h / ${path.weeklyHours}h/wk = ~${expectedWeeks}w).`
      );
    }

    const milestoneResourceIds = new Set<string>();
    for (const resItem of milestone.resources) {
      if (milestoneResourceIds.has(resItem.resourceId)) {
        errors.push(`Duplicate resource '${resItem.resourceId}' detected in milestone '${milestone.title}'.`);
      }
      milestoneResourceIds.add(resItem.resourceId);
    }

    for (const skillItem of milestone.skills) {
      const slug = (skillItem.skillSlug || skillItem.skillName).toLowerCase().replace(/\s+/g, '-');

      if (allSeenSkillSlugs.has(slug)) {
        errors.push(`Duplicate skill '${slug}' appears in multiple milestones.`);
      }
      allSeenSkillSlugs.add(slug);
      skillOrderMap.set(slug, milestone.order);

      const learnerLvl = learnerLevels.get(slug);
      if (learnerLvl !== undefined && learnerLvl >= skillItem.targetLevel && skillItem.targetLevel > 0) {
        warnings.push(
          `Skill '${slug}' is already mastered (learner level: ${learnerLvl} >= target: ${skillItem.targetLevel}).`
        );
      }
    }
  }

  for (const edge of prerequisites) {
    const depSlug = (edge.skillSlug || edge.skillId).toLowerCase().replace(/\s+/g, '-');
    const prereqSlug = (edge.prerequisiteSlug || edge.prerequisiteSkillId).toLowerCase().replace(/\s+/g, '-');

    if (skillOrderMap.has(depSlug) && skillOrderMap.has(prereqSlug)) {
      const depMilestoneOrder = skillOrderMap.get(depSlug)!;
      const prereqMilestoneOrder = skillOrderMap.get(prereqSlug)!;

      if (prereqMilestoneOrder > depMilestoneOrder) {
        errors.push(
          `Prerequisite ordering violation: Skill '${depSlug}' appears in Milestone ${depMilestoneOrder} before its prerequisite '${prereqSlug}' in Milestone ${prereqMilestoneOrder}.`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
