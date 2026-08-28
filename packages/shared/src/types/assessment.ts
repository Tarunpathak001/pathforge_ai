export type AssessmentDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type QuestionType = 'MULTIPLE_CHOICE';

export interface AssessmentQuestionItem {
  id: string;
  assessmentId: string;
  question: string;
  questionType: QuestionType;
  options: string[];
  explanation?: string;
  difficulty: AssessmentDifficulty;
  skillId: string;
  skillName?: string;
  skillSlug?: string;
}

export interface AssessmentSkillItem {
  skillId: string;
  skillName: string;
  skillSlug: string;
}

export interface AssessmentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: AssessmentDifficulty;
  estimatedMinutes: number;
  passingScore: number; // e.g. 70
  isActive: boolean;
  skills: AssessmentSkillItem[];
  questionsCount?: number;
  questions?: AssessmentQuestionItem[];
}

export interface SubmitAssessmentInput {
  assessmentId: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: number; // 0-based option index
  }>;
  timeSpentSeconds?: number;
}

export interface AssessmentAnswerResult {
  questionId: string;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  skillId: string;
  skillName?: string;
}

export interface AssessmentAttemptResult {
  attemptId: string;
  assessmentId: string;
  title: string;
  score: number; // 0 to 100
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds?: number;
  answers: AssessmentAnswerResult[];
  strongTopics: string[];
  needsReviewTopics: string[];
  skillUpdates: Array<{
    skillId: string;
    skillName: string;
    previousLevel: number;
    newInferredLevel: number;
    confidence: number;
  }>;
  completedAt: Date;
}
