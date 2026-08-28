import prisma from '../db/client.js';
import type {
  SkillEvidenceItem,
  SkillStateItem,
  EvidenceType,
} from '@pathforge/shared';
import { inferSkillState } from '@pathforge/shared';

export interface RecordEvidenceInput {
  skillId: string;
  evidenceType: EvidenceType;
  sourceId?: string;
  score: number;
  confidence?: number;
  notes?: string;
}

export class SkillInferenceService {
  /**
   * Records a new evidence item and updates the authoritative SkillState for the skill.
   */
  async recordEvidence(
    learnerProfileId: string,
    input: RecordEvidenceInput
  ): Promise<SkillStateItem> {
    // 1. Create SkillEvidence record
    await prisma.skillEvidence.create({
      data: {
        learnerProfileId,
        skillId: input.skillId,
        evidenceType: input.evidenceType,
        sourceId: input.sourceId,
        score: input.score,
        confidence: input.confidence ?? 0.5,
        notes: input.notes,
      },
    });

    // 2. Infer and upsert updated SkillState
    return this.inferAndUpdateSkillState(learnerProfileId, input.skillId);
  }

  /**
   * Re-evaluates all evidence for a single skill and updates the SkillState record.
   */
  async inferAndUpdateSkillState(
    learnerProfileId: string,
    skillId: string
  ): Promise<SkillStateItem> {
    const profile = await prisma.learnerProfile.findUnique({
      where: { id: learnerProfileId },
      include: {
        skills: true,
      },
    });

    if (!profile) {
      const err = new Error('Learner profile not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        careerSkills: true,
      },
    });

    if (!skill) {
      const err = new Error(`Skill '${skillId}' not found.`);
      (err as any).statusCode = 404;
      throw err;
    }

    // Determine preserved self-reported level
    const matchedLearnerSkill = profile.skills.find(
      s =>
        s.name.toLowerCase() === skill.name.toLowerCase() ||
        s.normalizedName.toLowerCase() === skill.slug.toLowerCase() ||
        s.normalizedName.toLowerCase() === skill.name.toLowerCase()
    );
    const selfReportedLevel = matchedLearnerSkill ? matchedLearnerSkill.selfReportedLevel : 1;

    // Determine target level from career requirement or default 3
    const targetLevel =
      skill.careerSkills && skill.careerSkills.length > 0
        ? skill.careerSkills[0].requiredLevel
        : 3;

    // Fetch all historical evidence for this learner & skill
    const rawEvidence = await prisma.skillEvidence.findMany({
      where: {
        learnerProfileId,
        skillId,
      },
      orderBy: { createdAt: 'asc' },
    });

    const evidenceList: SkillEvidenceItem[] = rawEvidence.map(e => ({
      id: e.id,
      learnerProfileId: e.learnerProfileId,
      skillId: e.skillId,
      evidenceType: e.evidenceType as EvidenceType,
      sourceId: e.sourceId || undefined,
      score: e.score,
      confidence: e.confidence,
      notes: e.notes || undefined,
      createdAt: e.createdAt,
    }));

    // Run deterministic skill inference algorithm
    const inferred = inferSkillState({
      skillId: skill.id,
      skillName: skill.name,
      skillSlug: skill.slug,
      learnerProfileId,
      selfReportedLevel,
      targetLevel,
      evidenceList,
    });

    // Upsert authoritative SkillState table record
    const record = await prisma.skillState.upsert({
      where: {
        learnerProfileId_skillId: {
          learnerProfileId,
          skillId: skill.id,
        },
      },
      update: {
        inferredLevel: inferred.inferredLevel,
        confidence: inferred.confidence,
        evidenceScore: inferred.evidenceScore,
        status: inferred.status,
        lastAssessedAt: inferred.lastAssessedAt,
      },
      create: {
        learnerProfileId,
        skillId: skill.id,
        inferredLevel: inferred.inferredLevel,
        confidence: inferred.confidence,
        evidenceScore: inferred.evidenceScore,
        status: inferred.status,
        lastAssessedAt: inferred.lastAssessedAt,
      },
    });

    return {
      ...inferred,
      id: record.id,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Retrieves all current SkillState records for a learner.
   */
  async getLearnerSkillStates(userId: string): Promise<SkillStateItem[]> {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const states = await prisma.skillState.findMany({
      where: { learnerProfileId: profile.id },
      include: {
        skill: {
          include: { careerSkills: true },
        },
      },
    });

    // Also fetch preserved self-reported skills
    const learnerSkills = await prisma.learnerSkill.findMany({
      where: { profileId: profile.id },
    });
    const selfReportMap = new Map<string, number>();
    for (const ls of learnerSkills) {
      selfReportMap.set(ls.normalizedName.toLowerCase(), ls.selfReportedLevel);
      selfReportMap.set(ls.name.toLowerCase(), ls.selfReportedLevel);
    }

    return states.map(s => {
      const selfLevel =
        selfReportMap.get(s.skill.slug.toLowerCase()) ||
        selfReportMap.get(s.skill.name.toLowerCase()) ||
        1;
      const targetLevel =
        s.skill.careerSkills && s.skill.careerSkills.length > 0
          ? s.skill.careerSkills[0].requiredLevel
          : 3;

      return {
        id: s.id,
        learnerProfileId: s.learnerProfileId,
        skillId: s.skillId,
        skillName: s.skill.name,
        skillSlug: s.skill.slug,
        inferredLevel: s.inferredLevel,
        confidence: s.confidence,
        evidenceScore: s.evidenceScore,
        status: s.status as any,
        selfReportedLevel: selfLevel,
        targetLevel,
        gap: Math.max(0, targetLevel - s.inferredLevel),
        lastAssessedAt: s.lastAssessedAt,
        evidenceCount: 1,
        updatedAt: s.updatedAt,
      };
    });
  }
}

export const skillInferenceService = new SkillInferenceService();
export default skillInferenceService;
