import { z } from 'zod';

export const UpdateResourceProgressSchema = z.object({
  progressPercent: z.number().min(0).max(100),
  timeSpentMinutes: z.number().min(0).optional(),
});

export const SubmitAssessmentSchema = z.object({
  assessmentId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedAnswer: z.number().int().min(0).max(10),
    })
  ).min(1),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export const SubmitFeedbackSchema = z.object({
  resourceId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  feedbackType: z.enum([
    'TOO_EASY',
    'JUST_RIGHT',
    'TOO_DIFFICULT',
    'NOT_RELEVANT',
    'ALREADY_KNOWN',
    'VERY_USEFUL',
  ]),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export const AdaptiveRecalculateSchema = z.object({
  careerSlug: z.string().min(1).max(100).optional(),
  forceRegeneratePath: z.boolean().default(false).optional(),
});

export type UpdateResourceProgressInput = z.infer<typeof UpdateResourceProgressSchema>;
export type SubmitAssessmentSchemaInput = z.infer<typeof SubmitAssessmentSchema>;
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;
export type AdaptiveRecalculateInput = z.infer<typeof AdaptiveRecalculateSchema>;

