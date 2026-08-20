import { z } from 'zod';

export const TechnicalLevelEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']);
export const CompletionStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
export const InterestCategoryEnum = z.enum(['TECHNICAL', 'CAREER', 'INDUSTRY', 'PROBLEM_TYPE']);
export const LearningFormatEnum = z.enum([
  'VIDEO',
  'ARTICLES',
  'DOCUMENTATION',
  'INTERACTIVE',
  'PROJECTS',
  'MIXED',
]);
export const DifficultyPreferenceEnum = z.enum(['GRADUAL', 'CHALLENGING', 'INTENSIVE']);
export const ProjectPreferenceEnum = z.enum(['PROJECTS', 'BALANCED', 'THEORY']);

export const LearnerSkillInputSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required').max(100, 'Skill name too long'),
  selfReportedLevel: z.coerce.number().int().min(1).max(5).default(3),
  yearsExperience: z.coerce.number().min(0).max(50).optional().nullable(),
  confidence: z.coerce.number().int().min(1).max(5).optional().nullable(),
  evidence: z.string().max(500).optional().nullable(),
});

export const BulkSkillsInputSchema = z.object({
  skills: z
    .array(LearnerSkillInputSchema)
    .min(1, 'At least one skill required')
    .max(100, 'Too many skills'),
});

export const ProjectInputSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(150),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  technologies: z.array(z.string().trim().min(1)).default([]),
  role: z.string().trim().max(100).optional().nullable(),
  durationMonths: z.coerce.number().min(0).max(120).optional().nullable(),
  projectUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
});

export const LearningExperienceInputSchema = z.object({
  courseName: z.string().trim().min(1, 'Course name is required').max(200),
  provider: z.string().trim().min(1, 'Provider is required').max(100),
  subject: z.string().trim().max(100).optional().nullable(),
  status: CompletionStatusEnum.default('IN_PROGRESS'),
  completionDate: z.string().optional().nullable(),
});

export const CertificationInputSchema = z.object({
  name: z.string().trim().min(1, 'Certification name is required').max(200),
  issuer: z.string().trim().min(1, 'Issuer is required').max(100),
  issueDate: z.string().optional().nullable(),
  credentialUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export const LearnerInterestInputSchema = z.object({
  category: InterestCategoryEnum.default('TECHNICAL'),
  topic: z.string().trim().min(1, 'Topic is required').max(100),
});

export const InterestsBatchInputSchema = z.object({
  interests: z.array(LearnerInterestInputSchema).max(50),
});

export const LearningPreferenceInputSchema = z.object({
  learningFormat: LearningFormatEnum.default('MIXED'),
  difficultyPreference: DifficultyPreferenceEnum.default('CHALLENGING'),
  weeklyAvailabilityHours: z.string().min(1).max(20).default('10-15'),
  projectPreference: ProjectPreferenceEnum.default('BALANCED'),
});

export const CreateLearnerProfileSchema = z.object({
  userId: z.string().optional(),
  targetRole: z.string().trim().min(1, 'Target role is required').max(150),
  careerGoalDescription: z.string().max(2000).optional().nullable(),
  targetIndustry: z.string().max(100).optional().nullable(),
  targetCompanyType: z.string().max(100).optional().nullable(),
  targetTimeline: z.string().max(50).optional().nullable(),
  educationLevel: z.string().max(100).optional().nullable(),
  fieldOfStudy: z.string().max(100).optional().nullable(),
  experienceYears: z.coerce.number().min(0).max(50).optional().nullable(),
  professionalSummary: z.string().max(2000).optional().nullable(),
  technicalLevel: TechnicalLevelEnum.default('BEGINNER'),
  skills: z.array(LearnerSkillInputSchema).optional().default([]),
  projects: z.array(ProjectInputSchema).optional().default([]),
  learningExperiences: z.array(LearningExperienceInputSchema).optional().default([]),
  certifications: z.array(CertificationInputSchema).optional().default([]),
  interests: z.array(LearnerInterestInputSchema).optional().default([]),
  preference: LearningPreferenceInputSchema.optional().nullable(),
});

export const UpdateLearnerProfileSchema = CreateLearnerProfileSchema.partial().omit({
  userId: true,
});

export const AIExtractionRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Text is required')
    .max(10000, 'Text exceeds 10,000 characters limit'),
  context: z.string().max(1000).optional(),
});

export const ExtractedSkillSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(1).max(5),
  evidence: z.string().optional(),
  yearsExperience: z.number().optional(),
});

export const ExtractedProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  technologies: z.array(z.string()).default([]),
});

export const ExtractedProfileResponseSchema = z.object({
  targetRole: z.string().optional(),
  skills: z.array(ExtractedSkillSchema).default([]),
  interests: z.array(z.string()).default([]),
  projects: z.array(ExtractedProjectSchema).default([]),
  experienceLevel: TechnicalLevelEnum.optional(),
  weeklyAvailability: z.string().optional(),
  summary: z.string().optional(),
});
