import prisma from '../db/client.js';
import type {
  Career,
  CareerDetailResponse,
  CareerSkill,
  SkillGraphNode,
  SkillGraphEdge,
} from '@pathforge/shared';

export interface CareerFilter {
  category?: string;
  difficulty?: string;
  demandLevel?: string;
  search?: string;
}

export class CareerService {
  /**
   * Retrieves all active careers with optional filtering and search.
   * Performs an eager query to include skills and avoid N+1 query overhead.
   */
  async getCareers(filter?: CareerFilter) {
    const where: any = { isActive: true };

    if (filter?.category) {
      where.category = { equals: filter.category };
    }

    if (filter?.difficulty) {
      where.difficulty = { equals: filter.difficulty };
    }

    if (filter?.demandLevel) {
      where.demandLevel = { equals: filter.demandLevel };
    }

    if (filter?.search) {
      const search = filter.search.trim();
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const careers = await prisma.career.findMany({
      where,
      include: {
        skills: {
          include: {
            skill: true,
          },
          orderBy: [{ isCore: 'desc' }, { priority: 'asc' }],
        },
      },
      orderBy: { name: 'asc' },
    });

    return careers.map(career => {
      const parsedSkills = career.skills.map(cs => ({
        ...cs,
        skill: {
          ...cs.skill,
          aliases:
            typeof cs.skill.aliases === 'string' ? JSON.parse(cs.skill.aliases) : cs.skill.aliases,
        },
      }));

      const coreSkills = parsedSkills.filter(s => s.isCore || s.importance === 'CORE');

      return {
        id: career.id,
        name: career.name,
        slug: career.slug,
        category: career.category,
        description: career.description,
        difficulty: career.difficulty,
        typicalExperience: career.typicalExperience,
        demandLevel: career.demandLevel,
        totalSkillsCount: parsedSkills.length,
        coreSkillsCount: coreSkills.length,
        coreSkillsPreview: coreSkills.slice(0, 5).map(s => ({
          name: s.skill.name,
          requiredLevel: s.requiredLevel,
        })),
      };
    });
  }

  /**
   * Retrieves detailed career information by slug including grouped skills and prerequisite graph.
   */
  async getCareerBySlug(slug: string): Promise<CareerDetailResponse | null> {
    const career = await prisma.career.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        skills: {
          include: {
            skill: {
              include: {
                prerequisites: {
                  include: {
                    prerequisiteSkill: true,
                  },
                },
              },
            },
          },
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!career) {
      return null;
    }

    const skillIds = new Set(career.skills.map(cs => cs.skillId));

    // Format skills and group by importance
    const coreSkills: CareerSkill[] = [];
    const highSkills: CareerSkill[] = [];
    const mediumSkills: CareerSkill[] = [];
    const optionalSkills: CareerSkill[] = [];

    const graphNodes: SkillGraphNode[] = [];
    const graphEdges: SkillGraphEdge[] = [];
    const edgeKeySet = new Set<string>();

    for (const cs of career.skills) {
      const parsedSkill = {
        ...cs.skill,
        aliases:
          typeof cs.skill.aliases === 'string' ? JSON.parse(cs.skill.aliases) : cs.skill.aliases,
      };

      const careerSkillItem: CareerSkill = {
        id: cs.id,
        careerId: cs.careerId,
        skillId: cs.skillId,
        importance: cs.importance,
        requiredLevel: cs.requiredLevel,
        priority: cs.priority,
        rationale: cs.rationale,
        isCore: cs.isCore,
        createdAt: cs.createdAt,
        updatedAt: cs.updatedAt,
        skill: parsedSkill,
      };

      if (cs.isCore || cs.importance === 'CORE') {
        coreSkills.push(careerSkillItem);
      } else if (cs.importance === 'HIGH') {
        highSkills.push(careerSkillItem);
      } else if (cs.importance === 'MEDIUM') {
        mediumSkills.push(careerSkillItem);
      } else {
        optionalSkills.push(careerSkillItem);
      }

      graphNodes.push({
        id: cs.skill.id,
        name: cs.skill.name,
        slug: cs.skill.slug,
        category: cs.skill.category,
        skillType: cs.skill.skillType,
        requiredLevel: cs.requiredLevel,
        importance: cs.importance,
        isCore: cs.isCore,
      });

      // Include prerequisites for this skill that exist within or directly feed into this career
      for (const prereq of cs.skill.prerequisites) {
        const edgeKey = `${prereq.prerequisiteSkillId}->${prereq.skillId}`;
        if (!edgeKeySet.has(edgeKey)) {
          edgeKeySet.add(edgeKey);
          graphEdges.push({
            fromSkillId: prereq.prerequisiteSkillId,
            toSkillId: prereq.skillId,
            strength: prereq.strength,
            rationale: prereq.rationale,
          });

          // If the prerequisite skill is not already in the career skills list, add it as a foundational node
          if (!skillIds.has(prereq.prerequisiteSkillId)) {
            skillIds.add(prereq.prerequisiteSkillId);
            graphNodes.push({
              id: prereq.prerequisiteSkill.id,
              name: prereq.prerequisiteSkill.name,
              slug: prereq.prerequisiteSkill.slug,
              category: prereq.prerequisiteSkill.category,
              skillType: prereq.prerequisiteSkill.skillType,
              requiredLevel: 2, // Default baseline for foundational prerequisite
              importance: 'OPTIONAL',
              isCore: false,
            });
          }
        }
      }
    }

    const careerResult: Career = {
      id: career.id,
      name: career.name,
      slug: career.slug,
      description: career.description,
      category: career.category,
      difficulty: career.difficulty,
      typicalExperience: career.typicalExperience,
      demandLevel: career.demandLevel,
      isActive: career.isActive,
      createdAt: career.createdAt,
      updatedAt: career.updatedAt,
    };

    return {
      career: careerResult,
      skillsByImportance: {
        core: coreSkills,
        high: highSkills,
        medium: mediumSkills,
        optional: optionalSkills,
      },
      totalSkillsCount: career.skills.length,
      coreSkillsCount: coreSkills.length,
      prerequisiteGraph: {
        nodes: graphNodes,
        edges: graphEdges,
      },
    };
  }

  /**
   * Retrieves all skills associated with a career.
   */
  async getCareerSkills(slug: string) {
    const career = await prisma.career.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        skills: {
          include: {
            skill: {
              include: {
                prerequisites: {
                  include: {
                    prerequisiteSkill: true,
                  },
                },
              },
            },
          },
          orderBy: [{ isCore: 'desc' }, { priority: 'asc' }],
        },
      },
    });

    if (!career) {
      return null;
    }

    return career.skills.map(cs => ({
      id: cs.id,
      skillId: cs.skillId,
      name: cs.skill.name,
      slug: cs.skill.slug,
      category: cs.skill.category,
      skillType: cs.skill.skillType,
      description: cs.skill.description,
      aliases:
        typeof cs.skill.aliases === 'string' ? JSON.parse(cs.skill.aliases) : cs.skill.aliases,
      importance: cs.importance,
      requiredLevel: cs.requiredLevel,
      priority: cs.priority,
      rationale: cs.rationale,
      isCore: cs.isCore,
      prerequisites: cs.skill.prerequisites.map(p => ({
        name: p.prerequisiteSkill.name,
        slug: p.prerequisiteSkill.slug,
        strength: p.strength,
        rationale: p.rationale,
      })),
    }));
  }
}

export const careerService = new CareerService();
