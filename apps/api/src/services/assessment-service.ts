import prisma from '../db/client.js';
import type {
  AssessmentItem,
  AssessmentQuestionItem,
  SubmitAssessmentInput,
  AssessmentAttemptResult,
  AssessmentAnswerResult,
} from '@pathforge/shared';
import { skillInferenceService } from './skill-inference-service.js';

export class AssessmentService {
  /**
   * Retrieves all active assessments.
   */
  async getAssessments(): Promise<AssessmentItem[]> {
    const assessments = await prisma.assessment.findMany({
      where: { isActive: true },
      include: {
        skills: { include: { skill: true } },
        questions: { select: { id: true } },
      },
      orderBy: { title: 'asc' },
    });

    return assessments.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      description: a.description,
      difficulty: a.difficulty as any,
      estimatedMinutes: a.estimatedMinutes,
      passingScore: a.passingScore,
      isActive: a.isActive,
      skills: a.skills.map(s => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        skillSlug: s.skill.slug,
      })),
      questionsCount: a.questions.length,
    }));
  }

  /**
   * Retrieves a single assessment by ID or slug.
   * By default, strips out correct answers to prevent client cheating.
   */
  async getAssessmentById(
    identifier: string,
    includeAnswers: boolean = false
  ): Promise<AssessmentItem> {
    const assessment = await prisma.assessment.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        skills: { include: { skill: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: { skill: true },
        },
      },
    });

    if (!assessment) {
      const err = new Error(`Assessment '${identifier}' not found.`);
      (err as any).statusCode = 404;
      throw err;
    }

    const questions: AssessmentQuestionItem[] = assessment.questions.map(q => ({
      id: q.id,
      assessmentId: q.assessmentId,
      question: q.question,
      questionType: q.questionType as any,
      options: JSON.parse(q.options),
      explanation: includeAnswers ? q.explanation : undefined,
      difficulty: q.difficulty as any,
      skillId: q.skillId,
      skillName: q.skill.name,
      skillSlug: q.skill.slug,
    }));

    return {
      id: assessment.id,
      title: assessment.title,
      slug: assessment.slug,
      description: assessment.description,
      difficulty: assessment.difficulty as any,
      estimatedMinutes: assessment.estimatedMinutes,
      passingScore: assessment.passingScore,
      isActive: assessment.isActive,
      skills: assessment.skills.map(s => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        skillSlug: s.skill.slug,
      })),
      questionsCount: questions.length,
      questions,
    };
  }

  /**
   * Evaluates submitted answers on the server, records attempt & answer items,
   * logs SkillEvidence, and updates the learner's inferred skill level.
   */
  async submitAssessmentAttempt(
    userId: string,
    input: SubmitAssessmentInput
  ): Promise<AssessmentAttemptResult> {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err = new Error('Learner profile not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Fetch assessment with authoritative questions and correct answers
    const assessment = await prisma.assessment.findUnique({
      where: { id: input.assessmentId },
      include: {
        skills: { include: { skill: true } },
        questions: {
          include: { skill: true },
        },
      },
    });

    if (!assessment) {
      const err = new Error(`Assessment '${input.assessmentId}' not found.`);
      (err as any).statusCode = 404;
      throw err;
    }

    const questions = assessment.questions;
    if (questions.length === 0) {
      const err = new Error('Assessment has no configured questions.');
      (err as any).statusCode = 400;
      throw err;
    }

    // Build map of submitted answers: questionId -> selectedAnswer
    const answerMap = new Map<string, number>();
    for (const ans of input.answers) {
      answerMap.set(ans.questionId, ans.selectedAnswer);
    }

    // Evaluate answers
    let correctCount = 0;
    const answerResults: AssessmentAnswerResult[] = [];
    const skillScoreMap = new Map<string, { correct: number; total: number; name: string }>();

    for (const q of questions) {
      const selected = answerMap.get(q.id) ?? -1;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;

      answerResults.push({
        questionId: q.id,
        question: q.question,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        skillId: q.skillId,
        skillName: q.skill.name,
      });

      // Group per skill
      if (!skillScoreMap.has(q.skillId)) {
        skillScoreMap.set(q.skillId, { correct: 0, total: 0, name: q.skill.name });
      }
      const entry = skillScoreMap.get(q.skillId)!;
      entry.total++;
      if (isCorrect) entry.correct++;
    }

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= assessment.passingScore;

    // Categorize strong vs needs review topics
    const strongTopics: string[] = [];
    const needsReviewTopics: string[] = [];

    for (const [skillId, stats] of skillScoreMap.entries()) {
      const pct = Math.round((stats.correct / stats.total) * 100);
      if (pct >= 75) {
        strongTopics.push(stats.name);
      } else {
        needsReviewTopics.push(stats.name);
      }
    }

    // Transactionally persist Attempt and Answers
    const attemptRecord = await prisma.$transaction(async tx => {
      const attempt = await tx.assessmentAttempt.create({
        data: {
          learnerProfileId: profile.id,
          assessmentId: assessment.id,
          score,
          passed,
          timeSpentSeconds: input.timeSpentSeconds || 0,
        },
      });

      for (const res of answerResults) {
        await tx.assessmentAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: res.questionId,
            selectedAnswer: res.selectedAnswer,
            isCorrect: res.isCorrect,
          },
        });
      }

      return attempt;
    });

    // Record SkillEvidence and update inferred skill states
    const skillUpdates: Array<{
      skillId: string;
      skillName: string;
      previousLevel: number;
      newInferredLevel: number;
      confidence: number;
    }> = [];

    for (const [skillId, stats] of skillScoreMap.entries()) {
      const skillScore = Math.round((stats.correct / stats.total) * 100);

      // Check previous state
      const prevState = await prisma.skillState.findUnique({
        where: {
          learnerProfileId_skillId: {
            learnerProfileId: profile.id,
            skillId,
          },
        },
      });
      const prevLevel = prevState ? prevState.inferredLevel : 1;

      // Record assessment evidence
      const updatedState = await skillInferenceService.recordEvidence(profile.id, {
        skillId,
        evidenceType: 'ASSESSMENT',
        sourceId: attemptRecord.id,
        score: skillScore,
        confidence: 0.9,
        notes: `Assessment: ${assessment.title} (${score}%)`,
      });

      skillUpdates.push({
        skillId,
        skillName: stats.name,
        previousLevel: prevLevel,
        newInferredLevel: updatedState.inferredLevel,
        confidence: updatedState.confidence,
      });
    }

    return {
      attemptId: attemptRecord.id,
      assessmentId: assessment.id,
      title: assessment.title,
      score,
      passed,
      passingScore: assessment.passingScore,
      totalQuestions,
      correctCount,
      timeSpentSeconds: input.timeSpentSeconds,
      answers: answerResults,
      strongTopics,
      needsReviewTopics,
      skillUpdates,
      completedAt: attemptRecord.completedAt,
    };
  }

  /**
   * Retrieves past attempt details with full question breakdown.
   */
  async getAttemptResult(userId: string, attemptId: string): Promise<AssessmentAttemptResult> {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err = new Error('Learner profile not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: true,
        answers: {
          include: {
            question: {
              include: { skill: true },
            },
          },
        },
      },
    });

    if (!attempt || attempt.learnerProfileId !== profile.id) {
      const err = new Error('Assessment attempt not found or access denied.');
      (err as any).statusCode = 404;
      throw err;
    }

    const answers: AssessmentAnswerResult[] = attempt.answers.map(a => ({
      questionId: a.questionId,
      question: a.question.question,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.question.correctAnswer,
      isCorrect: a.isCorrect,
      explanation: a.question.explanation,
      skillId: a.question.skillId,
      skillName: a.question.skill.name,
    }));

    const correctCount = answers.filter(a => a.isCorrect).length;
    const strongTopics = Array.from(new Set(answers.filter(a => a.isCorrect).map(a => a.skillName || '')));
    const needsReviewTopics = Array.from(new Set(answers.filter(a => !a.isCorrect).map(a => a.skillName || '')));

    return {
      attemptId: attempt.id,
      assessmentId: attempt.assessmentId,
      title: attempt.assessment.title,
      score: attempt.score,
      passed: attempt.passed,
      passingScore: attempt.assessment.passingScore,
      totalQuestions: answers.length,
      correctCount,
      timeSpentSeconds: attempt.timeSpentSeconds,
      answers,
      strongTopics,
      needsReviewTopics,
      skillUpdates: [],
      completedAt: attempt.completedAt,
    };
  }
}

export const assessmentService = new AssessmentService();
export default assessmentService;
