import prisma from '../db/client.js';
import type {
  GenerateLearningPathInput,
  LearningPathReport,
  LearningMilestoneItem,
  MilestoneSkillItem,
  MilestoneResourceItem,
  MilestoneStatus,
  PathStatus,
  MilestoneResourceRole,
  LearningResource,
} from '@pathforge/shared';
import {
  generateLearningPath as generatePathCore,
  validateLearningPath,
} from '@pathforge/shared';
import { skillGapService } from './skill-gap-service.js';

export class LearningPathService {
  /**
   * Generates, validates, and persists a personalized learning roadmap.
   * Archives previous active roadmaps for this career.
   */
  async generateLearningPath(
    userId: string,
    input: GenerateLearningPathInput = {}
  ): Promise<LearningPathReport> {
    // 1. Fetch user's learner profile
    const profile = await prisma.learnerProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        preference: true,
        interests: true,
        projects: true,
        learningExperiences: true,
        certifications: true,
      },
    });

    if (!profile) {
      const err = new Error('Learner profile not found. Please complete profile onboarding.');
      (err as any).statusCode = 404;
      throw err;
    }

    // 2. Identify target career
    let career = null;
    if (input.careerSlug) {
      career = await prisma.career.findUnique({ where: { slug: input.careerSlug } });
    } else if (input.careerId) {
      career = await prisma.career.findUnique({ where: { id: input.careerId } });
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

    // 3. Retrieve or compute latest Phase 3 skill gap analysis
    let gapReport = await skillGapService.getLatestAnalysis(userId, career.slug);
    if (!gapReport) {
      gapReport = await skillGapService.analyzeCareerGap(userId, { careerSlug: career.slug });
    }

    // 4. Retrieve all prerequisite graph edges
    const rawPrereqs = await prisma.skillPrerequisite.findMany({
      include: {
        skill: true,
        prerequisiteSkill: true,
      },
    });

    const allPrerequisites = rawPrereqs.map(p => ({
      skillId: p.skillId,
      prerequisiteSkillId: p.prerequisiteSkillId,
      skillSlug: p.skill.slug,
      prerequisiteSlug: p.prerequisiteSkill.slug,
    }));

    // 5. Fetch all active candidate learning resources with skill mappings
    const rawResources = await prisma.learningResource.findMany({
      where: { isActive: true },
      include: {
        skills: { include: { skill: true } },
        prerequisites: { include: { skill: true } },
      },
    });

    const candidateResources: LearningResource[] = rawResources.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      resourceType: r.resourceType as any,
      provider: r.provider,
      url: r.url,
      difficulty: r.difficulty as any,
      estimatedHours: r.estimatedHours,
      language: r.language,
      isFree: r.isFree,
      qualityScore: r.qualityScore,
      isActive: r.isActive,
      skills: r.skills.map(s => ({
        id: s.id,
        resourceId: s.resourceId,
        skillId: s.skillId,
        skillName: s.skill.name,
        skillSlug: s.skill.slug,
        coverage: s.coverage as any,
      })),
      prerequisites: r.prerequisites.map(p => ({
        id: p.id,
        resourceId: p.resourceId,
        skillId: p.skillId,
        skillName: p.skill.name,
        skillSlug: p.skill.slug,
        requiredLevel: p.requiredLevel,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // 6. Generate deterministic learning path
    const pathReport = generatePathCore({
      userId,
      learnerProfileId: profile.id,
      career: {
        id: career.id,
        name: career.name,
        slug: career.slug,
      },
      gapReport,
      allPrerequisites,
      candidateResources,
      learnerProfile: {
        targetRole: profile.targetRole,
        technicalLevel: profile.technicalLevel,
        skills: profile.skills.map(s => ({
          name: s.name,
          normalizedName: s.normalizedName,
          selfReportedLevel: s.selfReportedLevel,
        })),
      },
      learnerPreference: profile.preference ? {
        learningFormat: profile.preference.learningFormat,
        weeklyAvailabilityHours: profile.preference.weeklyAvailabilityHours,
      } : undefined,
      weeklyHoursOverride: input.weeklyHours,
      algorithmVersion: 'path-v1',
    });

    // 7. Validate path with Path Validation Engine
    const validation = validateLearningPath(pathReport, {
      prerequisites: allPrerequisites,
      learnerSkills: profile.skills.map(s => ({
        name: s.name,
        normalizedName: s.normalizedName,
        selfReportedLevel: s.selfReportedLevel,
      })),
    });

    if (!validation.isValid) {
      const err = new Error(`Learning path validation failed: ${validation.errors.join('; ')}`);
      (err as any).statusCode = 400;
      throw err;
    }

    // 8. Transactionally persist path and archive previous active paths
    const createdPathRecord = await prisma.$transaction(async tx => {
      // Archive any existing active paths for this user & career
      await tx.learningPath.updateMany({
        where: {
          userId,
          careerId: career!.id,
          status: 'ACTIVE',
        },
        data: {
          status: 'ARCHIVED',
        },
      });

      // Create new LearningPath record
      const pathRecord = await tx.learningPath.create({
        data: {
          userId,
          learnerProfileId: profile.id,
          careerId: career!.id,
          title: pathReport.title,
          description: pathReport.description,
          readinessAtGeneration: pathReport.readinessAtGeneration,
          estimatedHours: pathReport.estimatedHours,
          estimatedWeeks: pathReport.estimatedWeeks,
          weeklyHours: pathReport.weeklyHours,
          status: 'ACTIVE',
          algorithmVersion: pathReport.algorithmVersion,
          whyThisOrderOverview: JSON.stringify(pathReport.whyThisOrderOverview || []),
        },
      });

      // Create Milestones and their Skill & Resource relations
      for (const m of pathReport.milestones) {
        const milestoneRecord = await tx.learningMilestone.create({
          data: {
            learningPathId: pathRecord.id,
            title: m.title,
            description: m.description,
            order: m.order,
            estimatedHours: m.estimatedHours,
            estimatedWeeks: m.estimatedWeeks,
            learningObjectives: JSON.stringify(m.learningObjectives),
            completionCriteria: JSON.stringify(m.completionCriteria),
            whyThisOrder: m.whyThisOrder,
            status: m.status,
          },
        });

        // Add milestone skills
        for (const s of m.skills) {
          await tx.milestoneSkill.create({
            data: {
              milestoneId: milestoneRecord.id,
              skillId: s.skillId,
              targetLevel: s.targetLevel,
              order: s.order,
            },
          });
        }

        // Add milestone resources
        for (const r of m.resources) {
          await tx.milestoneResource.create({
            data: {
              milestoneId: milestoneRecord.id,
              resourceId: r.resourceId,
              order: r.order,
              role: r.role,
              estimatedHours: r.estimatedHours,
            },
          });
        }
      }

      return pathRecord;
    });

    return {
      ...pathReport,
      id: createdPathRecord.id,
      createdAt: createdPathRecord.createdAt,
      updatedAt: createdPathRecord.updatedAt,
    };
  }

  /**
   * Retrieves the latest active learning path for user, auto-generating if none exists.
   */
  async getLatestLearningPath(
    userId: string,
    careerSlug?: string
  ): Promise<LearningPathReport> {
    const existing = await prisma.learningPath.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        ...(careerSlug ? { career: { slug: careerSlug } } : {}),
      },
      include: {
        career: true,
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            skills: {
              orderBy: { order: 'asc' },
              include: { skill: true },
            },
            resources: {
              orderBy: { order: 'asc' },
              include: {
                resource: {
                  include: {
                    skills: { include: { skill: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existing) {
      return this.generateLearningPath(userId, { careerSlug });
    }

    return this.mapPrismaToReport(existing);
  }

  /**
   * Retrieves a specific learning path by ID with ownership verification.
   */
  async getLearningPathById(userId: string, id: string): Promise<LearningPathReport> {
    const existing = await prisma.learningPath.findUnique({
      where: { id },
      include: {
        career: true,
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            skills: {
              orderBy: { order: 'asc' },
              include: { skill: true },
            },
            resources: {
              orderBy: { order: 'asc' },
              include: {
                resource: {
                  include: {
                    skills: { include: { skill: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existing || existing.userId !== userId) {
      const err = new Error('Learning path not found or access denied.');
      (err as any).statusCode = 404;
      throw err;
    }

    return this.mapPrismaToReport(existing);
  }

  /**
   * Regenerates a fresh active roadmap for an existing path.
   */
  async regenerateLearningPath(
    userId: string,
    pathId: string,
    input: GenerateLearningPathInput = {}
  ): Promise<LearningPathReport> {
    const current = await this.getLearningPathById(userId, pathId);
    return this.generateLearningPath(userId, {
      ...input,
      careerSlug: current.careerSlug,
      regenerate: true,
    });
  }

  /**
   * Retrieves milestones for a learning path.
   */
  async getMilestonesByPathId(userId: string, pathId: string) {
    const path = await this.getLearningPathById(userId, pathId);
    return path.milestones;
  }

  /**
   * Maps Prisma database entity to standard LearningPathReport structure.
   */
  private mapPrismaToReport(record: any): LearningPathReport {
    const milestones: LearningMilestoneItem[] = record.milestones.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      order: m.order,
      estimatedHours: m.estimatedHours,
      estimatedWeeks: m.estimatedWeeks,
      learningObjectives: m.learningObjectives ? JSON.parse(m.learningObjectives) : [],
      completionCriteria: m.completionCriteria ? JSON.parse(m.completionCriteria) : [],
      whyThisOrder: m.whyThisOrder || '',
      status: m.status as MilestoneStatus,
      skills: m.skills.map((s: any) => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        skillSlug: s.skill.slug,
        currentLevel: 0,
        targetLevel: s.targetLevel,
        gap: s.targetLevel,
        order: s.order,
        importance: 'HIGH',
        category: s.skill.category,
      })),
      resources: m.resources.map((r: any) => ({
        id: r.id,
        resourceId: r.resourceId,
        resource: {
          id: r.resource.id,
          title: r.resource.title,
          slug: r.resource.slug,
          description: r.resource.description,
          resourceType: r.resource.resourceType,
          provider: r.resource.provider,
          url: r.resource.url,
          difficulty: r.resource.difficulty,
          estimatedHours: r.resource.estimatedHours,
          isFree: r.resource.isFree,
          qualityScore: r.resource.qualityScore,
          isActive: r.resource.isActive,
          skills: r.resource.skills.map((sk: any) => ({
            id: sk.id,
            resourceId: sk.resourceId,
            skillId: sk.skillId,
            skillName: sk.skill.name,
            skillSlug: sk.skill.slug,
            coverage: sk.coverage,
          })),
        },
        order: r.order,
        role: r.role as MilestoneResourceRole,
        estimatedHours: r.estimatedHours,
      })),
    }));

    return {
      id: record.id,
      userId: record.userId,
      learnerProfileId: record.learnerProfileId,
      careerId: record.careerId,
      careerName: record.career.name,
      careerSlug: record.career.slug,
      title: record.title,
      description: record.description,
      readinessAtGeneration: record.readinessAtGeneration,
      estimatedHours: record.estimatedHours,
      estimatedWeeks: record.estimatedWeeks,
      weeklyHours: record.weeklyHours,
      status: record.status as PathStatus,
      algorithmVersion: record.algorithmVersion,
      whyThisOrderOverview: record.whyThisOrderOverview ? JSON.parse(record.whyThisOrderOverview) : [],
      milestones,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

export const learningPathService = new LearningPathService();
export default learningPathService;
