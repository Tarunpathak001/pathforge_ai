import prisma from '../db/client.js';
import type {
  SubmitFeedbackInput,
  LearningFeedbackItem,
} from '@pathforge/shared';

export class FeedbackService {
  /**
   * Records user feedback on a resource or milestone.
   */
  async recordFeedback(userId: string, input: SubmitFeedbackInput): Promise<LearningFeedbackItem> {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err = new Error('Learner profile not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const record = await prisma.learningFeedback.create({
      data: {
        learnerProfileId: profile.id,
        resourceId: input.resourceId,
        milestoneId: input.milestoneId,
        feedbackType: input.feedbackType,
        rating: input.rating,
        comment: input.comment,
      },
    });

    return {
      id: record.id,
      learnerProfileId: record.learnerProfileId,
      resourceId: record.resourceId,
      milestoneId: record.milestoneId,
      feedbackType: record.feedbackType as any,
      rating: record.rating,
      comment: record.comment,
      createdAt: record.createdAt,
    };
  }

  /**
   * Retrieves all feedbacks submitted by a learner.
   */
  async getLearnerFeedback(userId: string): Promise<LearningFeedbackItem[]> {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const list = await prisma.learningFeedback.findMany({
      where: { learnerProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(f => ({
      id: f.id,
      learnerProfileId: f.learnerProfileId,
      resourceId: f.resourceId,
      milestoneId: f.milestoneId,
      feedbackType: f.feedbackType as any,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt,
    }));
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;
