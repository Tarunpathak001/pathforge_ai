import { z } from 'zod';

export const DashboardQuerySchema = z.object({
  careerSlug: z.string().min(1).max(100).optional(),
  refresh: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

export const SwitchDashboardCareerSchema = z.object({
  careerSlug: z.string().min(1).max(100),
  autoRecalculate: z.boolean().default(true).optional(),
});

export type DashboardQueryInput = z.infer<typeof DashboardQuerySchema>;
export type SwitchDashboardCareerInput = z.infer<typeof SwitchDashboardCareerSchema>;
