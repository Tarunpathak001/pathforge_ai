import prisma from '../db/client.js';
import type {
  ResourceProgressItem,
  ResourceProgressStatus,
  PathProgressReport,
} from '@pathforge/shared';
import {
  calculatePathProgress,
} from '@pathforge/shared';
import { skillInferenceService } from './skill-inference-service.js';

export class ProgressService {
  /**
   * Starts tracking progress for a resource.
   */
  async startResource(userId: string, resourceId: string): Promise<ResourceProgressItem> {
    const profile = await this.getLearnerProfile(userId);

    const existing = await prisma.resourceProgress.findUnique({
      where: {
        learnerProfileId_resourceId: {
          learnerProfileId: profile.id,
          resourceId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'NOT_STARTED') {
        const updated = await prisma.resourceProgress.update({
          where: { id: existing.id },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            lastAccessedAt: new Date(),
          },
        });
        return this.mapResourceProgress(updated);
      }
      return this.mapResourceProgress(existing);
    }

    const created = await prisma.resourceProgress.create({
      data: {
        learnerProfileId: profile.id,
        resourceId,
        status: 'IN_PROGRESS',
        progressPercent: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    });

    return this.mapResourceProgress(created);
  }

  /**
   * Updates incremental progress percentage for a resource.
   */
  async updateResourceProgress(
    userId: string,
    resourceId: string,
    progressPercent: number,
    timeSpentMinutes?: number
  ): Promise<ResourceProgressItem> {
    const profile = await this.getLearnerProfile(userId);
    const clampedPercent = Math.max(0, Math.min(100, progressPercent));

    let status: ResourceProgressStatus = 'IN_PROGRESS';
    let completedAt: Date | null = null;

    if (clampedPercent === 100) {
      status = 'COMPLETED';
      completedAt = new Date();
    } else if (clampedPercent === 0) {
      status = 'NOT_STARTED';
    }

    const record = await prisma.resourceProgress.upsert({
      where: {
        learnerProfileId_resourceId: {
          learnerProfileId: profile.id,
          resourceId,
        },
      },
      update: {
        progressPercent: clampedPercent,
        status,
        ...(completedAt ? { completedAt } : {}),
        ...(timeSpentMinutes !== undefined
          ? { timeSpentMinutes: { increment: timeSpentMinutes } }
          : {}),
        lastAccessedAt: new Date(),
      },
      create: {
        learnerProfileId: profile.id,
        resourceId,
        progressPercent: clampedPercent,
        status,
        startedAt: new Date(),
        completedAt,
        timeSpentMinutes: timeSpentMinutes || 0,
        lastAccessedAt: new Date(),
      },
    });

    // If resource completed, record evidence for covered skills
    if (status === 'COMPLETED') {
      await this.recordResourceCompletionEvidence(profile.id, resourceId);
    }

    return this.mapResourceProgress(record);
  }

  /**
   * Marks a resource as 100% completed.
   */
  async completeResource(userId: string, resourceId: string): Promise<ResourceProgressItem> {
    return this.updateResourceProgress(userId, resourceId, 100);
  }

  /**
   * Marks a resource as SKIPPED.
   */
  async skipResource(userId: string, resourceId: string): Promise<ResourceProgressItem> {
    const profile = await this.getLearnerProfile(userId);

    const record = await prisma.resourceProgress.upsert({
      where: {
        learnerProfileId_resourceId: {
          learnerProfileId: profile.id,
          resourceId,
        },
      },
      update: {
        status: 'SKIPPED',
        lastAccessedAt: new Date(),
      },
      create: {
        learnerProfileId: profile.id,
        resourceId,
        status: 'SKIPPED',
        progressPercent: 0,
        lastAccessedAt: new Date(),
      },
    });

    return this.mapResourceProgress(record);
  }

  /**
   * Retrieves full weighted progress for a specific learning path.
   */
  async getPathProgress(userId: string, pathId?: string): Promise<PathProgressReport> {
    const profile = await this.getLearnerProfile(userId);

    // Fetch learning path
    const learningPath = await prisma.learningPath.findFirst({
      where: {
        userId,
        ...(pathId ? { id: pathId } : { status: 'ACTIVE' }),
      },
      include: {
        career: true,
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            skills: { include: { skill: true } },
            resources: {
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

    if (!learningPath) {
      const err = new Error('No learning path found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Fetch all user's resource progress records
    const rawProgress = await prisma.resourceProgress.findMany({
      where: { learnerProfileId: profile.id },
    });

    const resourceProgressList: ResourceProgressItem[] = rawProgress.map(rp => ({
      id: rp.id,
      learnerProfileId: rp.learnerProfileId,
      resourceId: rp.resourceId,
      status: rp.status as ResourceProgressStatus,
      progressPercent: rp.progressPercent,
      startedAt: rp.startedAt,
      completedAt: rp.completedAt,
      timeSpentMinutes: rp.timeSpentMinutes,
      lastAccessedAt: rp.lastAccessedAt,
    }));

    const milestones = learningPath.milestones.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      order: m.order,
      estimatedHours: m.estimatedHours,
      estimatedWeeks: m.estimatedWeeks,
      learningObjectives: m.learningObjectives ? JSON.parse(m.learningObjectives) : [],
      completionCriteria: m.completionCriteria ? JSON.parse(m.completionCriteria) : [],
      whyThisOrder: m.whyThisOrder || '',
      status: m.status as any,
      skills: m.skills.map(s => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        skillSlug: s.skill.slug,
        currentLevel: 0,
        targetLevel: s.targetLevel,
        gap: s.targetLevel,
        order: s.order,
      })),
      resources: m.resources.map(r => ({
        id: r.id,
        resourceId: r.resourceId,
        order: r.order,
        role: r.role as any,
        estimatedHours: r.estimatedHours,
        resource: {
          id: r.resource.id,
          title: r.resource.title,
          slug: r.resource.slug,
          description: r.resource.description,
          resourceType: r.resource.resourceType as any,
          provider: r.resource.provider,
          url: r.resource.url,
          difficulty: r.resource.difficulty as any,
          estimatedHours: r.resource.estimatedHours,
          isFree: r.resource.isFree,
          qualityScore: r.resource.qualityScore,
          isActive: r.resource.isActive,
          skills: r.resource.skills.map(sk => ({
            id: sk.id,
            resourceId: sk.resourceId,
            skillId: sk.skillId,
            skillName: sk.skill.name,
            skillSlug: sk.skill.slug,
            coverage: sk.coverage as any,
          })),
        },
      })),
    }));

    return calculatePathProgress({
      pathId: learningPath.id,
      careerId: learningPath.careerId,
      careerName: learningPath.career.name,
      milestones,
      resourceProgressList,
    });
  }

  /**
   * Helper to record evidence when a learning resource is completed.
   */
  private async recordResourceCompletionEvidence(learnerProfileId: string, resourceId: string) {
    const resource = await prisma.learningResource.findUnique({
      where: { id: resourceId },
      include: { skills: true },
    });

    if (resource && resource.skills) {
      for (const rs of resource.skills) {
        await skillInferenceService.recordEvidence(learnerProfileId, {
          skillId: rs.skillId,
          evidenceType: 'RESOURCE_COMPLETION',
          sourceId: resourceId,
          score: 80, // Default 80% completion score
          confidence: 0.55,
          notes: `Completed curated resource: ${resource.title}`,
        });
      }
    }
  }

  private async getLearnerProfile(userId: string) {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err = new Error('Learner profile not found.');
      (err as any).statusCode = 404;
      throw err;
    }
    return profile;
  }

  private mapResourceProgress(record: any): ResourceProgressItem {
    return {
      id: record.id,
      learnerProfileId: record.learnerProfileId,
      resourceId: record.resourceId,
      status: record.status as ResourceProgressStatus,
      progressPercent: record.progressPercent,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      timeSpentMinutes: record.timeSpentMinutes,
      lastAccessedAt: record.lastAccessedAt,
    };
  }
}

export const progressService = new ProgressService();
export default progressService;
