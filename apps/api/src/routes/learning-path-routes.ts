import { Router, Request, Response, NextFunction } from 'express';
import { learningPathService } from '../services/learning-path-service.js';
import {
  GenerateLearningPathInputSchema,
  LearningPathQuerySchema,
} from '@pathforge/shared';

const router = Router();

function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * POST /api/learning-path/generate
 * Generates and persists a fresh learning roadmap.
 */
router.post(
  '/generate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const parsedInput = GenerateLearningPathInputSchema.parse(req.body);
      const path = await learningPathService.generateLearningPath(userId, parsedInput);
      res.status(200).json({ status: 'success', data: path });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/learning-path
 * Retrieves the latest active learning roadmap for the user.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const query = LearningPathQuerySchema.parse(req.query);
      const path = await learningPathService.getLatestLearningPath(userId, query.careerSlug);
      res.status(200).json({ status: 'success', data: path });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/learning-path/:id
 * Retrieves a specific learning path by ID.
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ status: 'error', message: 'Path ID is required' });
        return;
      }
      const path = await learningPathService.getLearningPathById(userId, id);
      res.status(200).json({ status: 'success', data: path });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/learning-path/:id/regenerate
 * Regenerates an active roadmap from an existing path ID.
 */
router.post(
  '/:id/regenerate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ status: 'error', message: 'Path ID is required' });
        return;
      }
      const parsedInput = GenerateLearningPathInputSchema.parse(req.body);
      const path = await learningPathService.regenerateLearningPath(userId, id, parsedInput);
      res.status(200).json({ status: 'success', data: path });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/learning-path/:id/milestones
 * Retrieves the milestones for a learning path.
 */
router.get(
  '/:id/milestones',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ status: 'error', message: 'Path ID is required' });
        return;
      }
      const milestones = await learningPathService.getMilestonesByPathId(userId, id);
      res.status(200).json({ status: 'success', data: milestones });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
