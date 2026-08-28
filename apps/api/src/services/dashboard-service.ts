import prisma from '../db/client.js';
import type {
  DashboardSummary,
  DashboardCareerAlignment,
  DashboardCurrentMilestone,
  DashboardRoadmapPreview,
  DashboardSkillSummary,
  DashboardSkillProgressItem,
  DashboardRecommendationItem,
  DashboardActivityItem,
  DashboardWeeklySummary,
} from '@pathforge/shared';
import { skillGapService } from './skill-gap-service.js';
import { progressService } from './progress-service.js';
import { adaptiveService } from './adaptive-service.js';
import { skillInferenceService } from './skill-inference-service.js';

export class DashboardService {
  /**
   * Fast aggregated dashboard command center aggregator (< 300ms).
   */
  async getDashboardSummary(
    userId: string,
    careerSlug?: string,
    refresh: boolean = false
  ): Promise<DashboardSummary> {
    // 1. Fetch User & Profile
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
      return this.getEmptyDashboardSummary(user);
    }

    const profile = user.profile;

    // 2. Identify Target Career
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
      return this.getEmptyDashboardSummary(user);
    }

    // 3. Retrieve Latest Skill Gap Analysis
    let gapReport = await skillGapService.getLatestAnalysis(userId, career.slug);
    if (!gapReport || refresh) {
      gapReport = await skillGapService.analyzeCareerGap(userId, { careerSlug: career.slug });
    }

    // Alignment Delta Calculation
    const historicalAnalyses = await prisma.skillGapAnalysis.findMany({
      where: { learnerProfileId: profile.id, careerId: career.id },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    let alignmentDelta = 0;
    if (historicalAnalyses.length >= 2) {
      alignmentDelta = Math.round(
        historicalAnalyses[0].readinessScore - historicalAnalyses[1].readinessScore
      );
    }

    const alignment: DashboardCareerAlignment = {
      score: Math.round(gapReport.readinessScore),
      band: gapReport.readinessBand,
      delta: alignmentDelta,
      deltaReason:
        alignmentDelta > 0
          ? '↑ Improvement from your recent skill verification'
          : 'Baseline career alignment based on modeled requirements',
      strongCount: gapReport.strengths.length,
      developingCount: gapReport.developingSkills.length,
      gapCount: gapReport.criticalGaps.length,
      summary: gapReport.summaryText,
      explanation: `Your career alignment reflects how closely your current skill evidence matches the modeled requirements for ${career.name}.`,
    };

    // 4. Retrieve Active Learning Path & Progress
    let pathProgressReport = null;
    try {
      pathProgressReport = await progressService.getPathProgress(userId);
    } catch {
      // No active path
    }

    let currentMilestone: DashboardCurrentMilestone | null = null;
    let roadmapPreview: DashboardRoadmapPreview | null = null;

    if (pathProgressReport) {
      const milestones = pathProgressReport.milestones || [];
      const activeM =
        milestones.find(m => m.status === 'IN_PROGRESS' || m.status === 'AVAILABLE') ||
        milestones[0];

      if (activeM) {
        // Fetch detailed milestone record
        const mRecord = await prisma.learningMilestone.findUnique({
          where: { id: activeM.milestoneId },
          include: {
            skills: { include: { skill: true } },
          },
        });

        const skillStates = await skillInferenceService.getLearnerSkillStates(userId);
        const stateMap = new Map<string, any>(skillStates.map(s => [s.skillId, s]));

        currentMilestone = {
          id: activeM.milestoneId,
          title: activeM.title,
          description: mRecord?.description || '',
          order: activeM.order,
          progressPercent: activeM.progressPercent,
          completedHours: activeM.completedHours,
          totalHours: activeM.totalHours,
          status: activeM.status as any,
          skills: mRecord?.skills
            ? mRecord.skills.map(s => {
                const st = stateMap.get(s.skillId);
                const isMastered = st ? st.inferredLevel >= s.targetLevel : false;
                return {
                  skillId: s.skillId,
                  skillName: s.skill.name,
                  status: isMastered ? 'COMPLETED' : activeM.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING',
                  isMastered,
                };
              })
            : [],
        };
      }

      roadmapPreview = {
        pathId: pathProgressReport.pathId,
        title: `${career.name} Mastery Roadmap`,
        overallProgressPercent: pathProgressReport.overallProgressPercent,
        completedHours: pathProgressReport.completedHours,
        totalHours: pathProgressReport.totalHours,
        estimatedWeeks: Math.ceil(pathProgressReport.totalHours / 10),
        weeklyHours: profile.preference?.hoursPerWeek || 10,
        milestones: milestones.map(m => ({
          id: m.milestoneId,
          title: m.title,
          order: m.order,
          status: m.status as any,
          progressPercent: m.progressPercent,
          estimatedHours: m.totalHours,
        })),
      };
    }

    // 5. Build Skill Summary (Authoritative SkillState)
    const skillStates = await skillInferenceService.getLearnerSkillStates(userId);
    const skillStateMap = new Map<string, any>(
      skillStates.map(s => [s.skillSlug.toLowerCase(), s])
    );

    const skillSummary: DashboardSkillSummary = {
      strong: gapReport.strengths.map(s => {
        const measured = skillStateMap.get(s.skillSlug.toLowerCase());
        return {
          skillId: s.skillId,
          name: s.skillName,
          slug: s.skillSlug,
          level: measured ? measured.inferredLevel : s.learnerLevel,
          targetLevel: s.requiredLevel,
          gap: 0,
          category: s.categoryName,
          confidence: measured ? measured.confidence : 0.4,
          isCore: s.isCore,
        };
      }),
      developing: gapReport.developingSkills.map(s => {
        const measured = skillStateMap.get(s.skillSlug.toLowerCase());
        return {
          skillId: s.skillId,
          name: s.skillName,
          slug: s.skillSlug,
          level: measured ? measured.inferredLevel : s.learnerLevel,
          targetLevel: s.requiredLevel,
          gap: s.gap,
          category: s.categoryName,
          confidence: measured ? measured.confidence : 0.4,
          isCore: s.isCore,
        };
      }),
      criticalGaps: gapReport.criticalGaps.map(s => {
        const measured = skillStateMap.get(s.skillSlug.toLowerCase());
        return {
          skillId: s.skillId,
          name: s.skillName,
          slug: s.skillSlug,
          level: measured ? measured.inferredLevel : s.learnerLevel,
          targetLevel: s.requiredLevel,
          gap: s.gap,
          category: s.categoryName,
          confidence: measured ? measured.confidence : 0.35,
          isCore: s.isCore,
        };
      }),
    };

    // 6. Recent Skill Progress
    const recentSkillProgress: DashboardSkillProgressItem[] = [];
    for (const ss of skillStates) {
      if (ss.inferredLevel > ss.selfReportedLevel || ss.confidence >= 0.8) {
        recentSkillProgress.push({
          skillId: ss.skillId,
          skillName: ss.skillName,
          skillSlug: ss.skillSlug,
          fromLevel: ss.selfReportedLevel,
          toLevel: ss.inferredLevel,
          delta: ss.inferredLevel - ss.selfReportedLevel,
          confidence: ss.confidence,
          evidenceType: ss.confidence >= 0.85 ? 'ASSESSMENT' : 'RESOURCE_COMPLETION',
          updatedAt: ss.updatedAt || new Date(),
        });
      }
    }

    // 7. Top Recommendations Preview (Read stored recommendations)
    const storedRecs = await prisma.recommendation.findMany({
      where: {
        learnerProfileId: profile.id,
      },
      include: {
        resource: {
          include: {
            skills: { include: { skill: true } },
          },
        },
        skill: true,
      },
      orderBy: { finalScore: 'desc' },
      take: 3,
    });

    const recommendations: DashboardRecommendationItem[] = storedRecs.map(r => ({
      id: r.resource.id,
      title: r.resource.title,
      provider: r.resource.provider,
      url: r.resource.url,
      difficulty: r.resource.difficulty,
      resourceType: r.resource.resourceType,
      estimatedHours: r.resource.estimatedHours,
      matchScore: r.matchPercentage,
      qualityScore: r.qualityScore,
      primarySkillName: r.skill.name,
    }));

    // 8. Recent Activity Feed (From real events)
    const recentActivity: DashboardActivityItem[] = [];

    // Completed resources
    const completedResources = await prisma.resourceProgress.findMany({
      where: {
        learnerProfileId: profile.id,
        status: 'COMPLETED',
      },
      include: { resource: true },
      orderBy: { completedAt: 'desc' },
      take: 3,
    });

    for (const cr of completedResources) {
      recentActivity.push({
        id: `res-${cr.id}`,
        type: 'RESOURCE_COMPLETED',
        title: `Completed ${cr.resource.title}`,
        description: `Resource completed (${cr.resource.provider})`,
        timestamp: cr.completedAt || cr.updatedAt,
      });
    }

    // Assessment attempts
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { learnerProfileId: profile.id },
      include: { assessment: true },
      orderBy: { completedAt: 'desc' },
      take: 3,
    });

    for (const att of attempts) {
      recentActivity.push({
        id: `att-${att.id}`,
        type: 'ASSESSMENT_COMPLETED',
        title: `Scored ${att.score}% on ${att.assessment.title}`,
        description: att.passed ? '✓ Competency verified' : 'Developing competency',
        timestamp: att.completedAt,
      });
    }

    // Feedbacks
    const feedbacks = await prisma.learningFeedback.findMany({
      where: { learnerProfileId: profile.id },
      include: { resource: true },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    for (const fb of feedbacks) {
      recentActivity.push({
        id: `fb-${fb.id}`,
        type: 'FEEDBACK_SUBMITTED',
        title: `Rated resource "${fb.resource?.title || 'Learning Material'}"`,
        description: `Feedback: ${fb.feedbackType.replace('_', ' ')}`,
        timestamp: fb.createdAt,
      });
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 9. Weekly Summary
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyProgress = await prisma.resourceProgress.findMany({
      where: {
        learnerProfileId: profile.id,
        updatedAt: { gte: sevenDaysAgo },
      },
    });

    const weeklyCompletedHours =
      weeklyProgress.reduce((sum, p) => sum + p.timeSpentMinutes / 60, 0) ||
      (pathProgressReport ? Math.min(pathProgressReport.completedHours, 10) : 0);

    const weeklySummary: DashboardWeeklySummary = {
      completedHours: Math.round(weeklyCompletedHours * 10) / 10,
      targetWeeklyHours: profile.preference?.hoursPerWeek || 10,
      completedResources: completedResources.length,
      completedAssessments: attempts.length,
      skillsImproved: recentSkillProgress.length,
    };

    // 10. Next Best Action (Authoritative from Adaptive Engine)
    const nextAction = await adaptiveService.getNextAction(userId, career.slug);

    // 11. Stale Data Check
    let isStale = false;
    let staleReason: string | undefined = undefined;

    if (
      pathProgressReport &&
      pathProgressReport.careerName.toLowerCase() !== career.name.toLowerCase()
    ) {
      isStale = true;
      staleReason = `Your active learning path is configured for ${pathProgressReport.careerName}. Click to regenerate for ${career.name}.`;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      career: {
        id: career.id,
        name: career.name,
        slug: career.slug,
        description: career.description,
        category: career.category,
        difficulty: career.difficulty,
      },
      alignment,
      nextAction,
      currentMilestone,
      roadmap: roadmapPreview,
      skillSummary,
      recentSkillProgress,
      recommendations,
      recentActivity: recentActivity.slice(0, 5),
      weeklySummary,
      recentAdaptiveChange: null,
      isStale,
      staleReason,
      hasProfile: true,
      hasGapAnalysis: true,
      hasRoadmap: pathProgressReport !== null,
    };
  }

  /**
   * Switches learner target role and prepares fresh dashboard alignment.
   */
  async switchTargetCareer(
    userId: string,
    careerSlug: string,
    autoRecalculate: boolean = true
  ): Promise<DashboardSummary> {
    const career = await prisma.career.findUnique({ where: { slug: careerSlug } });
    if (!career) {
      const err = new Error(`Career '${careerSlug}' not found.`);
      (err as any).statusCode = 404;
      throw err;
    }

    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (profile) {
      await prisma.learnerProfile.update({
        where: { id: profile.id },
        data: { targetRole: career.name },
      });
    }

    if (autoRecalculate) {
      await adaptiveService.recalculateAndAdapt(userId, career.slug);
    }

    return this.getDashboardSummary(userId, career.slug, true);
  }

  private getEmptyDashboardSummary(user: any): DashboardSummary {
    return {
      user: {
        id: user?.id || 'default-user',
        name: user?.name || 'Learner',
        email: user?.email || '',
      },
      career: null,
      alignment: null,
      nextAction: null,
      currentMilestone: null,
      roadmap: null,
      skillSummary: { strong: [], developing: [], criticalGaps: [] },
      recentSkillProgress: [],
      recommendations: [],
      recentActivity: [],
      weeklySummary: {
        completedHours: 0,
        targetWeeklyHours: 10,
        completedResources: 0,
        completedAssessments: 0,
        skillsImproved: 0,
      },
      recentAdaptiveChange: null,
      isStale: false,
      hasProfile: !!user?.profile,
      hasGapAnalysis: false,
      hasRoadmap: false,
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
