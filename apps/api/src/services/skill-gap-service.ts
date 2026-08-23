import prisma from '../db/client.js';
import {
  calculateSkillGap,
  type SkillGapAnalysisReport,
  type SkillGapItem,
  type SkillGapSummary,
  type ReadinessBand,
  type SkillGapCategory,
  type SkillGapSeverity,
  type PrerequisiteReadiness,
} from '@pathforge/shared';

export class SkillGapService {
  /**
   * Run a fresh deterministic skill gap analysis for a learner against a target career
   * and persist the calculated results.
   */
  async analyzeCareerGap(
    userId: string,
    target: { careerId?: string; careerSlug?: string }
  ): Promise<SkillGapAnalysisReport> {
    // 1. Fetch learner profile with current skills
    const profile = await prisma.learnerProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
      },
    });

    if (!profile) {
      const error: any = new Error(
        'Learner profile not found. Please complete profile onboarding before analyzing skill gaps.'
      );
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch target career with required skills
    const career = await prisma.career.findFirst({
      where: {
        ...(target.careerId ? { id: target.careerId } : {}),
        ...(target.careerSlug ? { slug: target.careerSlug } : {}),
        isActive: true,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!career) {
      const error: any = new Error(`Career '${target.careerId || target.careerSlug}' not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (!career.skills || career.skills.length === 0) {
      const error: any = new Error(`Career '${career.name}' has no required skills configured.`);
      error.statusCode = 400;
      throw error;
    }

    // 3. Fetch all prerequisite edges for skills involved
    const careerSkillIds = career.skills.map(cs => cs.skillId);
    const prerequisites = await prisma.skillPrerequisite.findMany({
      where: {
        OR: [{ skillId: { in: careerSkillIds } }, { prerequisiteSkillId: { in: careerSkillIds } }],
      },
    });

    // 4. Run deterministic skill gap engine
    const report = calculateSkillGap({
      userId,
      learnerProfileId: profile.id,
      career: {
        id: career.id,
        name: career.name,
        slug: career.slug,
        description: career.description,
        category: career.category,
        difficulty: career.difficulty as any,
        typicalExperience: career.typicalExperience,
        demandLevel: career.demandLevel as any,
        isActive: career.isActive,
        createdAt: career.createdAt,
        updatedAt: career.updatedAt,
      },
      careerSkills: career.skills.map(cs => ({
        id: cs.id,
        skillId: cs.skillId,
        skill: {
          id: cs.skill.id,
          name: cs.skill.name,
          slug: cs.skill.slug,
          category: cs.skill.category,
          aliases: cs.skill.aliases,
          skillType: cs.skill.skillType,
          description: cs.skill.description,
        },
        importance: cs.importance as any,
        requiredLevel: cs.requiredLevel,
        priority: cs.priority,
        rationale: cs.rationale,
        isCore: cs.isCore,
      })),
      allPrerequisites: prerequisites.map(p => ({
        skillId: p.skillId,
        prerequisiteSkillId: p.prerequisiteSkillId,
        strength: p.strength,
        rationale: p.rationale,
      })),
      learnerSkills: profile.skills.map(s => ({
        id: s.id,
        name: s.name,
        normalizedName: s.normalizedName,
        selfReportedLevel: s.selfReportedLevel,
        evidence: s.evidence,
      })),
    });

    // 5. Persist the analysis and results in a database transaction
    const saved = await prisma.$transaction(async tx => {
      const createdAnalysis = await tx.skillGapAnalysis.create({
        data: {
          userId,
          learnerProfileId: profile.id,
          careerId: career.id,
          readinessScore: report.readinessScore,
          readinessBand: report.readinessBand,
          algorithmVersion: report.algorithmVersion,
          summary: report.summaryText,
          stats: JSON.stringify(report.stats),
        },
      });

      await tx.skillGapResult.createMany({
        data: report.allResults.map(r => ({
          analysisId: createdAnalysis.id,
          skillId: r.skillId,
          learnerLevel: r.learnerLevel,
          requiredLevel: r.requiredLevel,
          gap: r.gap,
          gapSeverity: r.gapSeverity,
          importance: r.importance.toString(),
          priorityScore: r.priorityScore,
          readiness: r.readiness,
          category: r.category,
          isCritical: r.isCritical,
          explanation: r.explanation,
          downstreamImpactCount: r.downstreamImpactCount,
        })),
      });

      return createdAnalysis;
    });

    return {
      ...report,
      id: saved.id,
    };
  }

  /**
   * Retrieve the latest analysis for a user, optionally filtered by career slug.
   * If no analysis exists yet, automatically generates one using the user's target career role.
   */
  async getLatestAnalysis(
    userId: string,
    careerSlug?: string
  ): Promise<SkillGapAnalysisReport | null> {
    const whereClause: any = { userId };
    if (careerSlug) {
      whereClause.career = { slug: careerSlug };
    }

    const latest = await prisma.skillGapAnalysis.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        career: true,
        results: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (latest) {
      return this.formatAnalysisEntity(latest);
    }

    // If no analysis exists, attempt auto-generation from target role or slug
    if (careerSlug) {
      return this.analyzeCareerGap(userId, { careerSlug });
    }

    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (profile && profile.targetRole) {
      // Find career matching targetRole
      const targetRoleSlug = profile.targetRole
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const career = await prisma.career.findFirst({
        where: {
          OR: [
            { slug: targetRoleSlug },
            { name: { contains: profile.targetRole } },
            { slug: 'backend-engineer' }, // sensible default
          ],
          isActive: true,
        },
      });

      if (career) {
        return this.analyzeCareerGap(userId, { careerId: career.id });
      }
    }

    return null;
  }

  /**
   * Retrieve a specific analysis report by ID, verifying user ownership.
   */
  async getAnalysisById(userId: string, analysisId: string): Promise<SkillGapAnalysisReport> {
    const analysis = await prisma.skillGapAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        career: true,
        results: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!analysis || analysis.userId !== userId) {
      const error: any = new Error('Skill gap analysis not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    return this.formatAnalysisEntity(analysis);
  }

  /**
   * Get user's analysis history
   */
  async getUserAnalyses(userId: string, limit = 10) {
    const analyses = await prisma.skillGapAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        career: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            demandLevel: true,
          },
        },
      },
    });

    return analyses.map(a => ({
      id: a.id,
      career: a.career,
      readinessScore: a.readinessScore,
      readinessBand: a.readinessBand,
      algorithmVersion: a.algorithmVersion,
      summary: a.summary,
      stats: a.stats ? JSON.parse(a.stats) : null,
      createdAt: a.createdAt,
    }));
  }

  /**
   * Format persisted database entity into SkillGapAnalysisReport
   */
  private formatAnalysisEntity(entity: any): SkillGapAnalysisReport {
    let stats: SkillGapSummary;
    try {
      stats = entity.stats
        ? JSON.parse(entity.stats)
        : {
            totalRequiredSkills: entity.results.length,
            strengthsCount: entity.results.filter((r: any) => r.category === 'STRENGTH').length,
            developingCount: entity.results.filter((r: any) => r.category === 'DEVELOPING').length,
            missingCount: entity.results.filter((r: any) => r.category === 'MISSING').length,
            criticalGapsCount: entity.results.filter((r: any) => r.isCritical).length,
            readyToLearnCount: entity.results.filter(
              (r: any) => r.readiness === 'READY' && r.gap > 0
            ).length,
          };
    } catch {
      stats = {
        totalRequiredSkills: entity.results.length,
        strengthsCount: 0,
        developingCount: 0,
        missingCount: 0,
        criticalGapsCount: 0,
        readyToLearnCount: 0,
      };
    }

    const allResults: SkillGapItem[] = entity.results.map((r: any) => {
      let aliases: string[] = [];
      try {
        aliases = r.skill.aliases ? JSON.parse(r.skill.aliases) : [];
      } catch {
        aliases = [];
      }

      let severityCategory: SkillGapSeverity = 'NO_GAP';
      if (r.gap >= 4) severityCategory = 'CRITICAL';
      else if (r.gap === 3) severityCategory = 'HIGH';
      else if (r.gap === 2) severityCategory = 'MODERATE';
      else if (r.gap === 1) severityCategory = 'LOW';

      return {
        skillId: r.skillId,
        skillName: r.skill.name,
        skillSlug: r.skill.slug,
        categoryName: r.skill.category,
        skillType: r.skill.skillType,
        description: r.skill.description,
        aliases,
        learnerLevel: r.learnerLevel,
        requiredLevel: r.requiredLevel,
        gap: r.gap,
        gapSeverity: r.gapSeverity,
        severityCategory,
        importance: r.importance,
        importanceWeight:
          r.importance === 'CORE'
            ? 1.0
            : r.importance === 'HIGH'
              ? 0.8
              : r.importance === 'MEDIUM'
                ? 0.5
                : 0.2,
        careerPriorityRank: 1,
        careerRationale: null,
        isCore: r.importance === 'CORE',
        readiness: r.readiness as PrerequisiteReadiness,
        readinessScore:
          r.readiness === 'READY' ? 1.0 : r.readiness === 'PARTIALLY_READY' ? 0.5 : 0.1,
        downstreamImpactCount: r.downstreamImpactCount,
        prerequisiteImpactScore: Math.min(1.0, r.downstreamImpactCount / 3.0),
        prerequisites: [],
        priorityScore: r.priorityScore,
        displayPriority: Math.round(r.priorityScore * 100),
        category: r.category as SkillGapCategory,
        isCritical: r.isCritical,
        explanation: r.explanation,
      };
    });

    const strengths = allResults.filter(i => i.category === 'STRENGTH');
    const developingSkills = allResults.filter(i => i.category === 'DEVELOPING');
    const missingSkills = allResults.filter(i => i.category === 'MISSING');
    const criticalGaps = allResults.filter(i => i.isCritical);

    const actionQueue = [...allResults]
      .filter(i => i.gap > 0)
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      id: entity.id,
      userId: entity.userId,
      learnerProfileId: entity.learnerProfileId,
      career: entity.career,
      readinessScore: Math.round(entity.readinessScore),
      readinessBand: entity.readinessBand as ReadinessBand,
      algorithmVersion: entity.algorithmVersion || 'v1',
      summaryText:
        entity.summary ||
        `Your skills currently align with ${Math.round(entity.readinessScore)}% of requirements.`,
      stats,
      strengths,
      developingSkills,
      missingSkills,
      criticalGaps,
      actionQueue,
      allResults,
      createdAt: entity.createdAt,
    };
  }
}

export const skillGapService = new SkillGapService();
export default skillGapService;
