import { Router, Request, Response, NextFunction } from 'express';
import { progressService } from '../services/progress-service.js';
import { UpdateResourceProgressSchema } from '@pathforge/shared';

const router = Router();

function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * POST /api/progress/resources/:resourceId/start
 * Starts tracking progress for a resource.
 */
router.post(
  '/resources/:resourceId/start',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const resourceId = req.params.resourceId as string;
      const progress = await progressService.startResource(userId, resourceId);
      res.status(200).json({ status: 'success', data: progress });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/progress/resources/:resourceId
 * Updates incremental progress percentage for a resource.
 */
router.patch(
  '/resources/:resourceId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const resourceId = req.params.resourceId as string;
      const parsed = UpdateResourceProgressSchema.parse(req.body);
      const progress = await progressService.updateResourceProgress(
        userId,
        resourceId,
        parsed.progressPercent,
        parsed.timeSpentMinutes
      );
      res.status(200).json({ status: 'success', data: progress });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/progress/resources/:resourceId/complete
 * Marks a resource as completed (100%).
 */
router.post(
  '/resources/:resourceId/complete',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const resourceId = req.params.resourceId as string;
      const progress = await progressService.completeResource(userId, resourceId);
      res.status(200).json({ status: 'success', data: progress });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/progress/resources/:resourceId/skip
 * Marks a resource as SKIPPED.
 */
router.post(
  '/resources/:resourceId/skip',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const resourceId = req.params.resourceId as string;
      const progress = await progressService.skipResource(userId, resourceId);
      res.status(200).json({ status: 'success', data: progress });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/progress/path/:pathId
 * Retrieves full weighted progress for a learning path.
 */
router.get(
  '/path/:pathId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const pathId = req.params.pathId as string;
      const report = await progressService.getPathProgress(userId, pathId);
      res.status(200).json({ status: 'success', data: report });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/progress/summary
 * Retrieves progress for the active learning path.
 */
router.get(
  '/summary',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const report = await progressService.getPathProgress(userId);
      res.status(200).json({ status: 'success', data: report });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
