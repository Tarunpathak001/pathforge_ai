import { Router, Request, Response, NextFunction } from 'express';
import { feedbackService } from '../services/feedback-service.js';
import { SubmitFeedbackSchema } from '@pathforge/shared';

const router = Router();

function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * POST /api/feedback
 * Records user feedback on a resource or milestone.
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const parsed = SubmitFeedbackSchema.parse(req.body);
      const result = await feedbackService.recordFeedback(userId, parsed);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/feedback
 * Retrieves all feedbacks submitted by the authenticated learner.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const feedbacks = await feedbackService.getLearnerFeedback(userId);
      res.status(200).json({ status: 'success', data: feedbacks });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
