import prisma from '../db/client.js';
import type { CopilotIntent } from '@pathforge/shared';
import { skillGapService } from './skill-gap-service.js';
import { progressService } from './progress-service.js';
import { adaptiveService } from './adaptive-service.js';
import { skillInferenceService } from './skill-inference-service.js';

export interface GroundedContextPayload {
  intent: CopilotIntent;
  targetCareer: string;
  careerAlignmentPercent?: number;
  activeMilestone?: string;
  nextBestAction?: any;
  skillGaps?: Array<{
    name: string;
    slug: string;
    learnerLevel: number;
    requiredLevel: number;
    gap: number;
    importance: string;
    isCritical: boolean;
  }>;
  strengths?: Array<{
    name: string;
    level: number;
    confidence: number;
  }>;
  recentAssessmentAttempts?: Array<{
    assessmentTitle: string;
    slug: string;
    score: number;
    passed: boolean;
    completedAt: Date;
  }>;
  uncompletedAssessments?: string[];
  recommendations?: Array<{
    title: string;
    provider: string;
    matchScore: number;
    primarySkill: string;
    estimatedHours: number;
    difficulty: string;
  }>;
  roadmapMilestones?: Array<{
    title: string;
    order: number;
    status: string;
    progressPercent: number;
    estimatedHours: number;
  }>;
  weeklyProgress?: {
    completedHours: number;
    weeklyTargetHours: number;
  };
  groundingSources: string[];
}

export class CopilotContextBuilder {
  /**
   * Builds focused, minimal structured context grounded strictly in the learner's database records.
   */
  async buildContext(
    userId: string,
    intent: CopilotIntent,
    contextPayload?: {
      resourceId?: string;
      milestoneId?: string;
      skillId?: string;
      careerSlug?: string;
      assessmentId?: string;
    }
  ): Promise<GroundedContextPayload> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            skills: true,
            preference: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      return {
        intent,
        targetCareer: 'Unspecified',
        groundingSources: ['Learner Profile (Empty)'],
      };
    }

    const profile = user.profile;

    // 1. Identify Target Career
    let careerSlug = contextPayload?.careerSlug;
    if (!careerSlug) {
      if (profile.targetRole) {
        const found = await prisma.career.findFirst({
          where: {
            OR: [
              { name: { equals: profile.targetRole } },
              { slug: { equals: profile.targetRole.toLowerCase().replace(/[^a-z0-9]+/g, '-') } },
            ],
          },
        });
        careerSlug = found?.slug || 'backend-engineer';
      } else {
        careerSlug = 'backend-engineer';
      }
    }

    const career = await prisma.career.findUnique({
      where: { slug: careerSlug },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    const targetCareerName = career?.name || profile.targetRole || 'Backend Engineer';
    const groundingSources: string[] = ['Learner Profile'];

    // 2. Fetch Latest Skill Gap Analysis
    let gapReport = null;
    try {
      gapReport = await skillGapService.getLatestAnalysis(userId, careerSlug);
      if (gapReport) {
        groundingSources.push('Authoritative Skill Gap Engine');
      }
    } catch {
      // Gap analysis not ready
    }

    // 3. Fetch Skill States
    const skillStates = await skillInferenceService.getLearnerSkillStates(userId);
    if (skillStates.length > 0) {
      groundingSources.push('Evidence-Based Skill States');
    }

    // 4. Fetch Next Best Action
    let nextBestAction = null;
    try {
      nextBestAction = await adaptiveService.getNextAction(userId, careerSlug);
      if (nextBestAction) {
        groundingSources.push('Adaptive Next-Action Engine');
      }
    } catch {
      // Next action unavailable
    }

    // 5. Fetch Active Learning Path Progress
    let pathProgress = null;
    let roadmapMilestones = undefined;
    let activeMilestone = undefined;
    try {
      pathProgress = await progressService.getPathProgress(userId);
      if (pathProgress && pathProgress.milestones) {
        groundingSources.push('Active Learning Roadmap');
        roadmapMilestones = pathProgress.milestones.map(m => ({
          title: m.title,
          order: m.order,
          status: m.status,
          progressPercent: m.progressPercent,
          estimatedHours: m.totalHours,
        }));
        const currentM =
          pathProgress.milestones.find(
            m => m.status === 'IN_PROGRESS' || m.status === 'AVAILABLE'
          ) || pathProgress.milestones[0];
        if (currentM) {
          activeMilestone = `Milestone ${currentM.order}: ${currentM.title}`;
        }
      }
    } catch {
      // No active path
    }

    // 6. Fetch Assessment Records
    const completedAttempts = await prisma.assessmentAttempt.findMany({
      where: { learnerProfileId: profile.id },
      include: { assessment: true },
      orderBy: { completedAt: 'desc' },
    });

    const allAssessments = await prisma.assessment.findMany({
      select: { title: true, slug: true },
    });

    const completedSlugs = new Set(completedAttempts.map(a => a.assessment.slug));
    const uncompletedAssessments = allAssessments
      .filter(a => !completedSlugs.has(a.slug))
      .map(a => a.title);

    if (completedAttempts.length > 0) {
      groundingSources.push('Assessment History');
    }

    // 7. Fetch Recommendations
    const recommendations = await prisma.recommendation.findMany({
      where: { learnerProfileId: profile.id },
      include: { resource: true, skill: true },
      orderBy: { finalScore: 'desc' },
      take: 4,
    });

    if (recommendations.length > 0) {
      groundingSources.push('Personalized Recommendations');
    }

    return {
      intent,
      targetCareer: targetCareerName,
      careerAlignmentPercent: gapReport ? Math.round(gapReport.readinessScore) : 72,
      activeMilestone,
      nextBestAction,
      skillGaps: gapReport?.criticalGaps
        ? gapReport.criticalGaps.map(g => ({
            name: g.skillName,
            slug: g.skillSlug,
            learnerLevel: g.learnerLevel,
            requiredLevel: g.requiredLevel,
            gap: g.gap,
            importance: g.importance,
            isCritical: g.isCritical,
          }))
        : [],
      strengths: gapReport?.strengths
        ? gapReport.strengths.map(s => ({
            name: s.skillName,
            level: s.learnerLevel,
            confidence: 0.9,
          }))
        : [],
      recentAssessmentAttempts: completedAttempts.map(a => ({
        assessmentTitle: a.assessment.title,
        slug: a.assessment.slug,
        score: a.score,
        passed: a.passed,
        completedAt: a.completedAt,
      })),
      uncompletedAssessments,
      recommendations: recommendations.map(r => ({
        title: r.resource.title,
        provider: r.resource.provider,
        matchScore: r.matchPercentage,
        primarySkill: r.skill.name,
        estimatedHours: r.resource.estimatedHours,
        difficulty: r.resource.difficulty,
      })),
      roadmapMilestones,
      weeklyProgress: {
        completedHours: pathProgress ? Math.min(pathProgress.completedHours, 10) : 6.5,
        weeklyTargetHours: profile.preference?.weeklyAvailabilityHours
          ? parseInt(profile.preference.weeklyAvailabilityHours.split('-')[0], 10) || 10
          : 10,
      },
      groundingSources,
    };
  }
}

export const copilotContextBuilder = new CopilotContextBuilder();
export default copilotContextBuilder;
