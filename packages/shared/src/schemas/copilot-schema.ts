import { z } from 'zod';

export const CopilotIntentSchema = z.enum([
  'CAREER_REQUIREMENTS',
  'SKILL_GAP',
  'RECOMMENDATION',
  'ROADMAP',
  'PROGRESS',
  'NEXT_ACTION',
  'PLANNING',
  'RESOURCE_EXPLANATION',
  'CONCEPT_EXPLANATION',
  'ASSESSMENT',
  'GENERAL_LEARNING',
  'UNKNOWN',
]);

export const CopilotActionTypeSchema = z.enum([
  'OPEN_RESOURCE',
  'OPEN_MILESTONE',
  'OPEN_ASSESSMENT',
  'OPEN_SKILL',
  'OPEN_PATH',
  'OPEN_DASHBOARD',
  'OPEN_RECOMMENDATIONS',
  'OPEN_GAP_ANALYSIS',
]);

export const CopilotActionSchema = z.object({
  type: CopilotActionTypeSchema,
  title: z.string().min(1).max(120),
  target: z.string().min(1).max(255),
  payload: z.record(z.any()).optional(),
});

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  initialMessage: z.string().min(1).max(2000).optional(),
  contextPayload: z
    .object({
      resourceId: z.string().optional(),
      milestoneId: z.string().optional(),
      skillId: z.string().optional(),
      careerSlug: z.string().optional(),
      assessmentId: z.string().optional(),
    })
    .optional(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  contextPayload: z
    .object({
      resourceId: z.string().optional(),
      milestoneId: z.string().optional(),
      skillId: z.string().optional(),
      careerSlug: z.string().optional(),
      assessmentId: z.string().optional(),
    })
    .optional(),
});

export const CopilotStructuredResponseSchema = z.object({
  answer: z.string().min(1),
  intent: CopilotIntentSchema,
  groundingSources: z.array(z.string()).default([]),
  citations: z.array(z.string()).default([]),
  suggestedActions: z.array(CopilotActionSchema).default([]),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageSchemaInput = z.infer<typeof SendMessageSchema>;
