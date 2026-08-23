import { z } from 'zod';

export const ResourceTypeEnum = z.enum([
  'COURSE',
  'PROJECT',
  'ARTICLE',
  'DOCUMENTATION',
  'VIDEO',
  'BOOK',
  'EXERCISE',
]);

export const ResourceDifficultyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

export const SkillCoverageLevelEnum = z.enum(['PRIMARY', 'SUPPORTING', 'MENTIONED']);

export const GenerateRecommendationsInputSchema = z.object({
  careerId: z.string().uuid().optional(),
  careerSlug: z.string().min(1).optional(),
  maxPerGap: z.number().int().min(1).max(10).default(4),
  minScore: z.number().min(0).max(1).default(0.45),
  includeSemantic: z.boolean().default(true),
});

export const RecommendationQuerySchema = z.object({
  careerSlug: z.string().optional(),
  skillId: z.string().optional(),
  resourceType: ResourceTypeEnum.optional(),
  difficulty: ResourceDifficultyEnum.optional(),
  isFree: z
    .string()
    .transform(v => v === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;
export type RecommendationQuery = z.infer<typeof RecommendationQuerySchema>;
