import prisma from '../db/client.js';
import type {
  AdaptiveChangeSummary,
  NextAction,
  SkillUpdateSummary,
  SkillStateItem,
} from '@pathforge/shared';
import {
  determineNextAction,
  calculateMilestoneProgress,
} from '@pathforge/shared';
import { skillGapService } from './skill-gap-service.js';
import { recommendationService } from './recommendation-service.js';
import { learningPathService } from './learning-path-service.js';
import { skillInferenceService } from './skill-inference-service.js';
import { assessmentService } from './assessment-service.js';

export class AdaptiveService {
  /**
   * Main closed-loop adaptation trigger:
   * Recalculates skill gaps with latest SkillStates, regenerates recommendations with feedback,
   * adapts learning roadmap while preserving completed steps, and computes Next Best Action.
   */
  async recalculateAndAdapt(
    userId: string,
    careerSlug?: string,
    forceRegeneratePath: boolean = false
  ): Promise<AdaptiveChangeSummary> {
    const profile = await prisma.learnerProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        gapAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!profile) {
      const err = new Error('Learner profile not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // 1. Identify Target Career
    let career = null;
    if (careerSlug) {
      career = await prisma.career.findUnique({ where: { slug: careerSlug } });
    } else if (profile.targetRole) {
      career = await prisma.career.findFirst({
        where: {
          OR: [
            { name: { equals: profile.targetRole } },
            { slug: { equals: profile.targetRole.toLowerCase().replace(/[^a-z0-9]+/g, '-') } },
          ],
        },
      });
    }

    if (!career) {
      career = await prisma.career.findFirst({ where: { isActive: true } });
    }

    if (!career) {
      const err = new Error('Target career not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // 2. Capture Previous Alignment Readiness
    const previousAnalysis = profile.gapAnalyses && profile.gapAnalyses.length > 0
      ? profile.gapAnalyses[0]
      : null;
    const readinessBefore = previousAnalysis ? Math.round(previousAnalysis.readinessScore) : 50;

    // Capture previous gap results for diffing
    const previousGapResults = previousAnalysis
      ? await prisma.skillGapResult.findMany({
          where: { analysisId: previousAnalysis.id },
          include: { skill: true },
        })
      : [];
    const prevGapMap = new Map<string, any>();
    for (const pg of previousGapResults) {
      prevGapMap.set(pg.skill.slug.toLowerCase(), pg);
    }

    // 3. Recalculate Skill Gap Report (using measured SkillStates)
    const newGapReport = await skillGapService.analyzeCareerGap(userId, {
      careerSlug: career.slug,
    });
    const readinessAfter = Math.round(newGapReport.readinessScore);

    // 4. Ingest and re-evaluate SkillStates
    const skillStatesList = await skillInferenceService.getLearnerSkillStates(userId);
    const skillStatesMap = new Map<string, SkillStateItem>();
    for (const ss of skillStatesList) {
      skillStatesMap.set(ss.skillId, ss);
      skillStatesMap.set(ss.skillSlug.toLowerCase(), ss);
    }

    // 5. Detect Changes & Gap Resolutions
    const skillsUpdated: SkillUpdateSummary[] = [];
    const gapsResolved: string[] = [];
    const gapsReduced: string[] = [];
    const explanationNarrative: string[] = [];

    for (const currentResult of newGapReport.allResults) {
      const slugKey = currentResult.skillSlug.toLowerCase();
      const prev = prevGapMap.get(slugKey);
      const measuredState = skillStatesMap.get(slugKey);

      if (measuredState) {
        const fromLevel = measuredState.selfReportedLevel;
        const toLevel = measuredState.inferredLevel;

        skillsUpdated.push({
          skillId: currentResult.skillId,
          skillName: currentResult.skillName,
          fromLevel,
          toLevel,
          confidence: measuredState.confidence,
          gapStatus: currentResult.category,
        });

        // Check if gap was resolved (was gap before, now gap is 0 or strength)
        if (prev && prev.gap > 0 && currentResult.gap === 0) {
          gapsResolved.push(currentResult.skillName);
          explanationNarrative.push(
            `✓ ${currentResult.skillName} gap resolved (inferred level ${toLevel}/5 with ${Math.round(
              measuredState.confidence * 100
            )}% confidence).`
          );
        } else if (prev && prev.gap > currentResult.gap) {
          gapsReduced.push(currentResult.skillName);
          explanationNarrative.push(
            `📈 ${currentResult.skillName} gap reduced from ${prev.gap} to ${currentResult.gap}.`
          );
        }
      }
    }

    if (readinessAfter > readinessBefore) {
      explanationNarrative.push(
        `🚀 Career Alignment for ${career.name} increased from ${readinessBefore}% to ${readinessAfter}%.`
      );
    }

    // 6. Recalculate Recommendations (with Feedback)
    await recommendationService.generateRecommendations(userId, {
      careerSlug: career.slug,
    });

    // 7. Adapt Learning Roadmap
    const currentPath = await prisma.learningPath.findFirst({
      where: {
        userId,
        careerId: career.id,
        status: 'ACTIVE',
      },
      include: {
        milestones: {
          include: {
            resources: true,
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate fresh adaptive learning roadmap
    const adaptedPath = await learningPathService.generateLearningPath(userId, {
      careerSlug: career.slug,
      regenerate: true,
    });

    const milestonesCompleted: string[] = [];
    const milestonesUnlocked: string[] = [];

    // Check newly unlocked / completed milestones
    if (adaptedPath.milestones && adaptedPath.milestones.length > 0) {
      for (const m of adaptedPath.milestones) {
        if (m.order === 1 || m.status === 'IN_PROGRESS') {
          milestonesUnlocked.push(m.title);
        }
      }
    }

    // 8. Determine Next Best Action
    const rawProgress = await prisma.resourceProgress.findMany({
      where: { learnerProfileId: profile.id },
    });
    const resourceProgressMap = new Map<string, any>();
    for (const rp of rawProgress) {
      resourceProgressMap.set(rp.resourceId, rp);
    }

    const availableAssessments = await assessmentService.getAssessments();

    const milestoneProgressList = adaptedPath.milestones.map((m, idx) =>
      calculateMilestoneProgress({
        milestone: m,
        resourceProgressMap,
        previousMilestoneCompleted: idx === 0,
      })
    );

    const nextAction = determineNextAction({
      careerName: career.name,
      milestones: adaptedPath.milestones,
      milestoneProgressList,
      resourceProgressMap,
      availableAssessments,
      skillStates: skillStatesMap,
    });

    if (nextAction) {
      explanationNarrative.push(`🎯 Recommended next action: ${nextAction.title}.`);
    }

    return {
      skillsUpdated,
      gapsResolved,
      gapsReduced,
      milestonesCompleted,
      milestonesUnlocked,
      recommendationsChanged: [career.name],
      careerAlignment: {
        before: readinessBefore,
        after: readinessAfter,
      },
      nextAction,
      explanationNarrative,
      adaptedAt: new Date(),
    };
  }

  /**
   * Retrieves the current Next Best Action for the learner.
   */
  async getNextAction(userId: string, careerSlug?: string): Promise<NextAction | null> {
    const summary = await this.recalculateAndAdapt(userId, careerSlug);
    return summary.nextAction;
  }
}

export const adaptiveService = new AdaptiveService();
export default adaptiveService;
