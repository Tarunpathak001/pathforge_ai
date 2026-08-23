import prisma from '../db/client.js';
import type {
  GenerateRecommendationsInput,
  RecommendationResponse,
  SkillGapRecommendationGroup,
  LearningResource,
} from '@pathforge/shared';
import {
  rankRecommendationsForGaps,
  MIN_RECOMMENDATION_SCORE_THRESHOLD,
} from '@pathforge/shared';
import { skillGapService } from './skill-gap-service.js';

export class RecommendationService {
  /**
   * Generates and persists fresh personalized learning recommendations
   * based on the learner's latest skill gap analysis.
   */
  async generateRecommendations(
    userId: string,
    input: Partial<GenerateRecommendationsInput> = {}
  ): Promise<RecommendationResponse> {
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
      // Default fallback to first career
      career = await prisma.career.findFirst({ where: { isActive: true } });
    }

    if (!career) {
      const err = new Error('No target career found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // 3. Retrieve or compute latest skill gap analysis
    let gapReport = await skillGapService.getLatestAnalysis(userId, career.slug);
    if (!gapReport) {
      gapReport = await skillGapService.analyzeCareerGap(userId, { careerSlug: career.slug });
    }

    // Combine critical and developing gaps as priority focus
    const focusGaps = [
      ...gapReport.criticalGaps,
      ...gapReport.developingSkills.filter(
        d => !gapReport!.criticalGaps.some(c => c.skillId === d.skillId)
      ),
      ...gapReport.missingSkills.filter(
        m => !gapReport!.criticalGaps.some(c => c.skillId === m.skillId)
      ),
    ];

    // 4. Fetch all active learning resources with skill mappings and prerequisites
    const rawResources = await prisma.learningResource.findMany({
      where: { isActive: true },
      include: {
        skills: {
          include: { skill: true },
        },
        prerequisites: {
          include: { skill: true },
        },
      },
    });

    const resources: LearningResource[] = rawResources.map(r => ({
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
      embedding: r.embedding ? JSON.parse(r.embedding) : null,
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

    const isSemanticFallback = input.includeSemantic === false;

    // 5. Run deterministic recommendation ranking engine
    const groups = rankRecommendationsForGaps({
      gaps: focusGaps,
      resources,
      careerName: career.name,
      careerId: career.id,
      careerSlug: career.slug,
      learnerProfile: profile as any,
      learnerPreference: profile.preference as any,
      maxPerGap: input.maxPerGap ?? 4,
      minScore: input.minScore ?? MIN_RECOMMENDATION_SCORE_THRESHOLD,
      isSemanticFallback,
    });

    // Count total recommended items
    let totalItems = 0;
    for (const g of groups) {
      totalItems += g.recommendations.length;
    }

    // 6. Persist generated recommendations in transaction
    await prisma.$transaction(async tx => {
      // Clear old recommendations for this user & career
      await tx.recommendation.deleteMany({
        where: {
          userId,
          careerId: career!.id,
        },
      });

      // Insert new recommendation items
      for (const group of groups) {
        for (const item of group.recommendations) {
          await tx.recommendation.create({
            data: {
              userId,
              learnerProfileId: profile.id,
              careerId: career!.id,
              skillId: item.targetSkillId,
              resourceId: item.resourceId,
              semanticScore: item.scoreBreakdown.semanticScore,
              coverageScore: item.scoreBreakdown.coverageScore,
              careerScore: item.scoreBreakdown.careerScore,
              difficultyScore: item.scoreBreakdown.difficultyScore,
              prerequisiteScore: item.scoreBreakdown.prerequisiteScore,
              preferenceScore: item.scoreBreakdown.preferenceScore,
              qualityScore: item.scoreBreakdown.qualityScore,
              finalScore: item.scoreBreakdown.finalScore,
              matchPercentage: item.scoreBreakdown.matchPercentage,
              rank: item.rank,
              explanation: JSON.stringify(item.explanation),
              isSemanticFallback: item.scoreBreakdown.isSemanticFallback,
              algorithmVersion: item.algorithmVersion,
            },
          });
        }
      }
    });

    return {
      careerId: career.id,
      careerName: career.name,
      careerSlug: career.slug,
      algorithmVersion: 'recommendation-v1',
      isSemanticFallback,
      totalRecommendations: totalItems,
      groups,
      generatedAt: new Date(),
    };
  }

  /**
   * Retrieves latest saved recommendations for user, auto-generating if not yet computed.
   */
  async getLatestRecommendations(
    userId: string,
    careerSlug?: string
  ): Promise<RecommendationResponse> {
    const existingRecs = await prisma.recommendation.findMany({
      where: {
        userId,
        ...(careerSlug ? { career: { slug: careerSlug } } : {}),
      },
      include: {
        career: true,
        skill: true,
        resource: {
          include: {
            skills: { include: { skill: true } },
            prerequisites: { include: { skill: true } },
          },
        },
      },
      orderBy: [{ skillId: 'asc' }, { rank: 'asc' }],
    });

    if (existingRecs.length === 0) {
      return this.generateRecommendations(userId, { careerSlug });
    }

    const first = existingRecs[0];
    if (!first) {
      return this.generateRecommendations(userId, { careerSlug });
    }
    const career = first.career;

    // Group recommendations by skill
    const groupMap = new Map<string, SkillGapRecommendationGroup>();

    for (const r of existingRecs) {
      let group = groupMap.get(r.skillId);
      if (!group) {
        group = {
          skillId: r.skillId,
          skillName: r.skill.name,
          skillSlug: r.skill.slug,
          importance: 'HIGH',
          learnerLevel: 0,
          requiredLevel: 4,
          gap: 4,
          isCritical: true,
          readiness: 'READY',
          recommendations: [],
        };
        groupMap.set(r.skillId, group);
      }

      group.recommendations.push({
        id: r.id,
        resourceId: r.resourceId,
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
          language: r.resource.language,
          isFree: r.resource.isFree,
          qualityScore: r.resource.qualityScore,
          isActive: r.resource.isActive,
          skills: r.resource.skills.map(s => ({
            id: s.id,
            resourceId: s.resourceId,
            skillId: s.skillId,
            skillName: s.skill.name,
            skillSlug: s.skill.slug,
            coverage: s.coverage as any,
          })),
        },
        targetSkillId: r.skillId,
        targetSkillName: r.skill.name,
        targetSkillSlug: r.skill.slug,
        rank: r.rank,
        scoreBreakdown: {
          semanticScore: r.semanticScore,
          coverageScore: r.coverageScore,
          careerScore: r.careerScore,
          difficultyScore: r.difficultyScore,
          prerequisiteScore: r.prerequisiteScore,
          preferenceScore: r.preferenceScore,
          qualityScore: r.qualityScore,
          finalScore: r.finalScore,
          matchPercentage: r.matchPercentage,
          isSemanticFallback: r.isSemanticFallback,
        },
        explanation: r.explanation ? JSON.parse(r.explanation) : [],
        algorithmVersion: r.algorithmVersion,
      });
    }

    return {
      careerId: career.id,
      careerName: career.name,
      careerSlug: career.slug,
      algorithmVersion: 'recommendation-v1',
      isSemanticFallback: first.isSemanticFallback,
      totalRecommendations: existingRecs.length,
      groups: Array.from(groupMap.values()),
      generatedAt: first.createdAt,
    };
  }

  /**
   * Retrieves single recommendation item by ID with ownership verification.
   */
  async getRecommendationById(userId: string, id: string) {
    const rec = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        career: true,
        skill: true,
        resource: {
          include: {
            skills: { include: { skill: true } },
            prerequisites: { include: { skill: true } },
          },
        },
      },
    });

    if (!rec || rec.userId !== userId) {
      const err = new Error('Recommendation not found or access denied.');
      (err as any).statusCode = 404;
      throw err;
    }

    return {
      ...rec,
      explanation: rec.explanation ? JSON.parse(rec.explanation) : [],
    };
  }

  /**
   * Retrieves recommendations for a specific skill.
   */
  async getRecommendationsBySkill(userId: string, skillId: string) {
    const recs = await prisma.recommendation.findMany({
      where: {
        userId,
        skillId,
      },
      include: {
        resource: {
          include: {
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { rank: 'asc' },
    });

    return recs.map(r => ({
      ...r,
      explanation: r.explanation ? JSON.parse(r.explanation) : [],
    }));
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
