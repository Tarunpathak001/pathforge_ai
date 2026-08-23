import { z } from 'zod';

export const SkillGapSeverityEnum = z.enum(['NO_GAP', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL']);
export const PrerequisiteReadinessEnum = z.enum(['READY', 'PARTIALLY_READY', 'BLOCKED']);
export const SkillGapCategoryEnum = z.enum(['STRENGTH', 'DEVELOPING', 'MISSING']);
export const ReadinessBandEnum = z.enum([
  'Starting Point',
  'Early Development',
  'Developing',
  'Strong Progress',
  'Career Ready',
]);

export const AnalyzeSkillGapInputSchema = z
  .object({
    careerId: z.string().optional(),
    careerSlug: z.string().optional(),
  })
  .refine(data => data.careerId || data.careerSlug, {
    message: 'Either careerId or careerSlug must be provided',
  });

export const SkillGapQuerySchema = z.object({
  careerSlug: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
