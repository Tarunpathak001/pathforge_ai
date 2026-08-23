import { z } from 'zod';

export const GenerateLearningPathInputSchema = z.object({
  careerId: z.string().uuid().optional(),
  careerSlug: z.string().min(1).max(100).optional(),
  weeklyHours: z.number().min(1).max(80).optional(),
  regenerate: z.boolean().default(false).optional(),
});

export const LearningPathQuerySchema = z.object({
  careerSlug: z.string().min(1).max(100).optional(),
  includeArchived: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

export type LearningPathQuery = z.infer<typeof LearningPathQuerySchema>;
