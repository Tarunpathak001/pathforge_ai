import { Router, Request, Response, NextFunction } from 'express';
import { recommendationService } from '../services/recommendation-service.js';
import {
  GenerateRecommendationsInputSchema,
  RecommendationQuerySchema,
} from '@pathforge/shared';

const router = Router();

// Helper to extract authenticated userId
function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * POST /api/recommendations/generate
 * Generates and persists fresh learning resource recommendations based on latest gap analysis.
 */
router.post(
  '/generate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const parsedInput = GenerateRecommendationsInputSchema.parse(req.body);
      const report = await recommendationService.generateRecommendations(userId, parsedInput);
      res.status(200).json({ status: 'success', data: report });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/recommendations
 * Retrieves latest saved recommendations grouped by skill gap.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const query = RecommendationQuerySchema.parse(req.query);
      const report = await recommendationService.getLatestRecommendations(userId, query.careerSlug);
      res.status(200).json({ status: 'success', data: report });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/recommendations/skill/:skillId
 * Retrieves recommendations for a specific skill.
 */
router.get(
  '/skill/:skillId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const skillId = req.params.skillId as string;
      if (!skillId) {
        res.status(400).json({ status: 'error', message: 'skillId is required' });
        return;
      }
      const recs = await recommendationService.getRecommendationsBySkill(userId, skillId);
      res.status(200).json({ status: 'success', data: recs });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/recommendations/:id
 * Retrieves single recommendation details with full component score breakdown.
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ status: 'error', message: 'id is required' });
        return;
      }
      const rec = await recommendationService.getRecommendationById(userId, id);
      res.status(200).json({ status: 'success', data: rec });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
