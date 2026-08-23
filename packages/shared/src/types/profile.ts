export type TechnicalLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';

export type CompletionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type InterestCategory = 'TECHNICAL' | 'CAREER' | 'INDUSTRY' | 'PROBLEM_TYPE';

export type LearningFormat =
  'VIDEO' | 'ARTICLES' | 'DOCUMENTATION' | 'INTERACTIVE' | 'PROJECTS' | 'MIXED';

export type DifficultyPreference = 'GRADUAL' | 'CHALLENGING' | 'INTENSIVE';

export type ProjectPreference = 'PROJECTS' | 'BALANCED' | 'THEORY';

export interface LearnerSkill {
  id?: string;
  profileId?: string;
  name: string;
  normalizedName: string;
  selfReportedLevel: number; // 1 to 5
  yearsExperience?: number | null;
  confidence?: number | null; // 1 to 5
  evidence?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Project {
  id?: string;
  profileId?: string;
  name: string;
  description: string;
  technologies: string[];
  role?: string | null;
  durationMonths?: number | null;
  projectUrl?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LearningExperience {
  id?: string;
  profileId?: string;
  courseName: string;
  provider: string;
  subject?: string | null;
  status: CompletionStatus;
  completionDate?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Certification {
  id?: string;
  profileId?: string;
  name: string;
  issuer: string;
  issueDate?: Date | string | null;
  credentialUrl?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LearnerInterest {
  id?: string;
  profileId?: string;
  category: InterestCategory;
  topic: string;
  createdAt?: Date | string;
}

export interface LearningPreference {
  id?: string;
  profileId?: string;
  learningFormat: LearningFormat;
  difficultyPreference: DifficultyPreference;
  weeklyAvailabilityHours: string; // e.g. "<5", "5-10", "10-15", "15+"
  projectPreference: ProjectPreference;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LearnerProfile {
  id?: string;
  userId: string;
  targetRole: string;
  careerGoalDescription?: string | null;
  targetIndustry?: string | null;
  targetCompanyType?: string | null;
  targetTimeline?: string | null;
  educationLevel?: string | null;
  fieldOfStudy?: string | null;
  experienceYears?: number | null;
  professionalSummary?: string | null;
  technicalLevel: TechnicalLevel;
  skills: LearnerSkill[];
  projects: Project[];
  learningExperiences: LearningExperience[];
  certifications: Certification[];
  interests: LearnerInterest[];
  preference?: LearningPreference | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProfileCompletenessBreakdown {
  careerGoal: boolean;
  experience: boolean;
  skills: boolean;
  projects: boolean;
  interests: boolean;
  learningPreferences: boolean;
}

export interface ProfileCompleteness {
  score: number; // 0 - 100
  percentage: number;
  breakdown: ProfileCompletenessBreakdown;
  summary: string;
}

export interface AIExtractionRequest {
  text: string;
  context?: string;
}

export interface ExtractedSkill {
  name: string;
  level: number;
  evidence?: string;
  yearsExperience?: number;
}

export interface ExtractedProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface ExtractedProfileResponse {
  targetRole?: string;
  skills: ExtractedSkill[];
  interests: string[];
  projects: ExtractedProject[];
  experienceLevel?: TechnicalLevel;
  weeklyAvailability?: string;
  summary?: string;
}
