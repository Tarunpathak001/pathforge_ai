import prisma from '../db/client.js';
import {
  validatePrerequisiteEdge,
  type Skill,
  type SkillDetailResponse,
  type SkillPrerequisiteTreeNode,
} from '@pathforge/shared';

export interface SkillFilter {
  category?: string;
  skillType?: string;
  search?: string;
}

export class SkillService {
  /**
   * Retrieves all active skills with optional category, skillType, and search filters.
   * Matches against skill name, description, and aliases.
   */
  async getSkills(filter?: SkillFilter) {
    const where: any = { isActive: true };

    if (filter?.category) {
      where.category = { equals: filter.category };
    }

    if (filter?.skillType) {
      where.skillType = { equals: filter.skillType };
    }

    if (filter?.search) {
      const search = filter.search.trim();
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { aliases: { contains: search } },
      ];
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return skills.map(s => ({
      ...s,
      aliases: typeof s.aliases === 'string' ? JSON.parse(s.aliases) : s.aliases,
    }));
  }

  /**
   * Retrieves a single skill by slug with its prerequisites, dependents, and target careers.
   */
  async getSkillBySlug(slug: string): Promise<SkillDetailResponse | null> {
    const skill = await prisma.skill.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        prerequisites: {
          include: {
            prerequisiteSkill: true,
          },
        },
        dependents: {
          include: {
            skill: true,
          },
        },
        careerSkills: {
          include: {
            career: true,
          },
          orderBy: [{ isCore: 'desc' }, { requiredLevel: 'desc' }],
        },
      },
    });

    if (!skill) {
      return null;
    }

    const parsedSkill: Skill = {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      category: skill.category,
      aliases: typeof skill.aliases === 'string' ? JSON.parse(skill.aliases) : skill.aliases,
      skillType: skill.skillType,
      isActive: skill.isActive,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    };

    return {
      skill: parsedSkill,
      prerequisites: skill.prerequisites.map(p => ({
        id: p.id,
        skill: {
          id: p.prerequisiteSkill.id,
          name: p.prerequisiteSkill.name,
          slug: p.prerequisiteSkill.slug,
          description: p.prerequisiteSkill.description,
          category: p.prerequisiteSkill.category,
          aliases:
            typeof p.prerequisiteSkill.aliases === 'string'
              ? JSON.parse(p.prerequisiteSkill.aliases)
              : p.prerequisiteSkill.aliases,
          skillType: p.prerequisiteSkill.skillType,
          isActive: p.prerequisiteSkill.isActive,
          createdAt: p.prerequisiteSkill.createdAt,
          updatedAt: p.prerequisiteSkill.updatedAt,
        },
        strength: p.strength,
        rationale: p.rationale,
      })),
      dependents: skill.dependents.map(d => ({
        id: d.id,
        skill: {
          id: d.skill.id,
          name: d.skill.name,
          slug: d.skill.slug,
          description: d.skill.description,
          category: d.skill.category,
          aliases:
            typeof d.skill.aliases === 'string' ? JSON.parse(d.skill.aliases) : d.skill.aliases,
          skillType: d.skill.skillType,
          isActive: d.skill.isActive,
          createdAt: d.skill.createdAt,
          updatedAt: d.skill.updatedAt,
        },
        strength: d.strength,
        rationale: d.rationale,
      })),
      usedInCareers: skill.careerSkills.map(cs => ({
        id: cs.id,
        careerName: cs.career.name,
        careerSlug: cs.career.slug,
        category: cs.career.category,
        importance: cs.importance,
        requiredLevel: cs.requiredLevel,
        rationale: cs.rationale,
      })),
    };
  }

  /**
   * Retrieves the multi-level prerequisite tree for a given skill.
   */
  async getSkillPrerequisites(slug: string): Promise<SkillPrerequisiteTreeNode | null> {
    const rootSkill = await prisma.skill.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!rootSkill) {
      return null;
    }

    const allSkills = await prisma.skill.findMany({ where: { isActive: true } });
    const allPrereqs = await prisma.skillPrerequisite.findMany();

    const skillMap = new Map<string, any>();
    for (const s of allSkills) {
      skillMap.set(s.id, {
        ...s,
        aliases: typeof s.aliases === 'string' ? JSON.parse(s.aliases) : s.aliases,
      });
    }

    const prereqAdj = new Map<
      string,
      Array<{ prereqId: string; strength: string; rationale: string | null }>
    >();
    for (const p of allPrereqs) {
      if (!prereqAdj.has(p.skillId)) {
        prereqAdj.set(p.skillId, []);
      }
      prereqAdj.get(p.skillId)!.push({
        prereqId: p.prerequisiteSkillId,
        strength: p.strength,
        rationale: p.rationale,
      });
    }

    const visited = new Set<string>();

    function buildTree(
      skillId: string,
      strength = 'ROOT',
      rationale: string | null = null
    ): SkillPrerequisiteTreeNode {
      const skillObj = skillMap.get(skillId);
      const node: SkillPrerequisiteTreeNode = {
        skill: skillObj,
        strength,
        rationale,
        prerequisites: [],
      };

      if (visited.has(skillId)) {
        return node;
      }
      visited.add(skillId);

      const children = prereqAdj.get(skillId) || [];
      for (const child of children) {
        node.prerequisites.push(buildTree(child.prereqId, child.strength, child.rationale));
      }

      visited.delete(skillId);
      return node;
    }

    return buildTree(rootSkill.id);
  }

  /**
   * Retrieves all direct and indirect dependent skills that require this skill.
   */
  async getSkillDependents(slug: string) {
    const targetSkill = await prisma.skill.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!targetSkill) {
      return null;
    }

    const dependents = await prisma.skillPrerequisite.findMany({
      where: { prerequisiteSkillId: targetSkill.id },
      include: {
        skill: true,
      },
    });

    return dependents.map(d => ({
      id: d.id,
      skill: {
        ...d.skill,
        aliases:
          typeof d.skill.aliases === 'string' ? JSON.parse(d.skill.aliases) : d.skill.aliases,
      },
      strength: d.strength,
      rationale: d.rationale,
    }));
  }

  /**
   * Adds a new prerequisite with application-level graph validation (no self-loops, no cycles, no duplicates).
   */
  async addPrerequisite(data: {
    skillId: string;
    prerequisiteSkillId: string;
    strength?: string;
    rationale?: string;
  }) {
    // 1. Fetch all existing prerequisite edges from DB
    const existingEdges = await prisma.skillPrerequisite.findMany({
      select: {
        skillId: true,
        prerequisiteSkillId: true,
      },
    });

    // 2. Validate graph
    const validation = validatePrerequisiteEdge(
      { skillId: data.skillId, prerequisiteSkillId: data.prerequisiteSkillId },
      existingEdges
    );

    if (!validation.isValid) {
      const error: any = new Error(validation.error);
      error.statusCode = 400;
      throw error;
    }

    // 3. Verify both skills exist
    const [skill, prereqSkill] = await Promise.all([
      prisma.skill.findUnique({ where: { id: data.skillId } }),
      prisma.skill.findUnique({ where: { id: data.prerequisiteSkillId } }),
    ]);

    if (!skill || !prereqSkill) {
      const error: any = new Error('One or both referenced skills do not exist');
      error.statusCode = 404;
      throw error;
    }

    // 4. Insert relationship
    return prisma.skillPrerequisite.create({
      data: {
        skillId: data.skillId,
        prerequisiteSkillId: data.prerequisiteSkillId,
        strength: data.strength || 'REQUIRED',
        rationale: data.rationale,
      },
    });
  }
}

export const skillService = new SkillService();
