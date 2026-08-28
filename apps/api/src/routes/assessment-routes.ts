import { Router, Request, Response, NextFunction } from 'express';
import { assessmentService } from '../services/assessment-service.js';
import { SubmitAssessmentSchema } from '@pathforge/shared';

const router = Router();

function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * GET /api/assessments
 * Retrieves all active assessments.
 */
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const assessments = await assessmentService.getAssessments();
      res.status(200).json({ status: 'success', data: assessments });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/assessments/:id
 * Retrieves an assessment by ID or slug (answers stripped out).
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const assessment = await assessmentService.getAssessmentById(id, false);
      res.status(200).json({ status: 'success', data: assessment });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/assessments/:id/attempt
 * Evaluates submitted answers on the server, logs evidence, and returns score & breakdown.
 */
router.post(
  '/:id/attempt',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const id = req.params.id as string;
      const parsed = SubmitAssessmentSchema.parse({
        ...req.body,
        assessmentId: id,
      });
      const result = await assessmentService.submitAssessmentAttempt(userId, parsed);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/assessments/attempts/:attemptId
 * Retrieves past attempt details.
 */
router.get(
  '/attempts/:attemptId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const attemptId = req.params.attemptId as string;
      const result = await assessmentService.getAttemptResult(userId, attemptId);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
