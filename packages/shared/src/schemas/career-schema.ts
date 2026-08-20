import { z } from 'zod';

export const CareerImportanceEnum = z.enum(['CORE', 'HIGH', 'MEDIUM', 'OPTIONAL']);
export const SkillTypeEnum = z.enum(['Technical', 'Tool', 'Concept', 'SoftSkill']);
export const SkillCategoryEnum = z.enum([
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'Cloud',
  'DevOps',
  'AI/ML',
  'Data',
  'Security',
  'Architecture',
  'Tools',
  'Soft Skills',
]);
export const PrerequisiteStrengthEnum = z.enum(['REQUIRED', 'RECOMMENDED', 'HELPFUL']);
export const CareerDifficultyEnum = z.enum(['ENTRY', 'INTERMEDIATE', 'ADVANCED']);
export const CareerDemandLevelEnum = z.enum(['HIGH', 'VERY_HIGH', 'MODERATE']);

export const CareerQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: CareerDifficultyEnum.optional(),
  demandLevel: CareerDemandLevelEnum.optional(),
  search: z.string().optional(),
});

export const SkillQuerySchema = z.object({
  category: z.string().optional(),
  skillType: SkillTypeEnum.optional(),
  search: z.string().optional(),
});

export const CreateSkillSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required').max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  category: SkillCategoryEnum,
  aliases: z.array(z.string().trim()).default([]),
  skillType: SkillTypeEnum.default('Technical'),
  isActive: z.boolean().default(true),
});

export const CreateCareerSchema = z.object({
  name: z.string().trim().min(1, 'Career name is required').max(150),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().min(1, 'Description is required').max(3000),
  category: z.string().trim().min(1).max(100),
  difficulty: CareerDifficultyEnum.default('INTERMEDIATE'),
  typicalExperience: z.string().max(100).optional().nullable(),
  demandLevel: CareerDemandLevelEnum.default('HIGH'),
  isActive: z.boolean().default(true),
});

export const CreateCareerSkillSchema = z.object({
  careerId: z.string().min(1),
  skillId: z.string().min(1),
  importance: CareerImportanceEnum.default('HIGH'),
  requiredLevel: z.coerce.number().int().min(1).max(5).default(3),
  priority: z.coerce.number().int().min(1).default(1),
  rationale: z.string().max(1000).optional().nullable(),
  isCore: z.boolean().default(false),
});

export const CreatePrerequisiteSchema = z.object({
  skillId: z.string().min(1, 'Target skill ID is required'),
  prerequisiteSkillId: z.string().min(1, 'Prerequisite skill ID is required'),
  strength: PrerequisiteStrengthEnum.default('REQUIRED'),
  rationale: z.string().max(1000).optional().nullable(),
});
