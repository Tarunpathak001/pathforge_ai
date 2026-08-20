export type CareerImportance = 'CORE' | 'HIGH' | 'MEDIUM' | 'OPTIONAL';

export type SkillType = 'Technical' | 'Tool' | 'Concept' | 'SoftSkill';

export type SkillCategory =
  | 'Programming'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Cloud'
  | 'DevOps'
  | 'AI/ML'
  | 'Data'
  | 'Security'
  | 'Architecture'
  | 'Tools'
  | 'Soft Skills';

export type PrerequisiteStrength = 'REQUIRED' | 'RECOMMENDED' | 'HELPFUL';

export type CareerDifficulty = 'ENTRY' | 'INTERMEDIATE' | 'ADVANCED';

export type CareerDemandLevel = 'HIGH' | 'VERY_HIGH' | 'MODERATE';

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SkillCategory | string;
  aliases: string[]; // Parsed from JSON in DB
  skillType: SkillType | string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SkillPrerequisite {
  id: string;
  skillId: string;
  prerequisiteSkillId: string;
  strength: PrerequisiteStrength | string;
  rationale?: string | null;
  createdAt: Date | string;
  skill?: Skill;
  prerequisiteSkill?: Skill;
}

export interface CareerSkill {
  id: string;
  careerId: string;
  skillId: string;
  importance: CareerImportance | string;
  requiredLevel: number; // 1 to 5: 1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert
  priority: number;
  rationale?: string | null;
  isCore: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  skill?: Skill;
}

export interface Career {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  difficulty: CareerDifficulty | string;
  typicalExperience?: string | null;
  demandLevel: CareerDemandLevel | string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  skills?: CareerSkill[];
}

export interface SkillGraphNode {
  id: string;
  name: string;
  slug: string;
  category: string;
  skillType: string;
  requiredLevel?: number;
  importance?: CareerImportance | string;
  isCore?: boolean;
}

export interface SkillGraphEdge {
  fromSkillId: string;
  toSkillId: string; // toSkillId requires fromSkillId
  strength: PrerequisiteStrength | string;
  rationale?: string | null;
}

export interface SkillPrerequisiteTreeNode {
  skill: Skill;
  strength: PrerequisiteStrength | string;
  rationale?: string | null;
  prerequisites: SkillPrerequisiteTreeNode[];
}

export interface CareerDetailResponse {
  career: Career;
  skillsByImportance: {
    core: CareerSkill[];
    high: CareerSkill[];
    medium: CareerSkill[];
    optional: CareerSkill[];
  };
  totalSkillsCount: number;
  coreSkillsCount: number;
  prerequisiteGraph: {
    nodes: SkillGraphNode[];
    edges: SkillGraphEdge[];
  };
}

export interface SkillDetailResponse {
  skill: Skill;
  prerequisites: Array<{
    id: string;
    skill: Skill;
    strength: PrerequisiteStrength | string;
    rationale?: string | null;
  }>;
  dependents: Array<{
    id: string;
    skill: Skill;
    strength: PrerequisiteStrength | string;
    rationale?: string | null;
  }>;
  usedInCareers: Array<{
    id: string;
    careerName: string;
    careerSlug: string;
    category: string;
    importance: CareerImportance | string;
    requiredLevel: number;
    rationale?: string | null;
  }>;
}
