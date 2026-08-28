import { Router, Request, Response, NextFunction } from 'express';
import { adaptiveService } from '../services/adaptive-service.js';
import { skillInferenceService } from '../services/skill-inference-service.js';
import { AdaptiveRecalculateSchema } from '@pathforge/shared';

const router = Router();

function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * POST /api/adaptive/recalculate
 * Triggers closed-loop adaptation: updates SkillStates, recalculates gaps,
 * re-ranks recommendations with feedback, adapts roadmap, and returns Change Summary.
 */
router.post(
  '/recalculate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const parsed = AdaptiveRecalculateSchema.parse(req.body || {});
      const summary = await adaptiveService.recalculateAndAdapt(
        userId,
        parsed.careerSlug,
        parsed.forceRegeneratePath
      );
      res.status(200).json({ status: 'success', data: summary });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/adaptive/next-action
 * Retrieves the single highest-impact Next Best Action for the learner.
 */
router.get(
  '/next-action',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const careerSlug = req.query.careerSlug as string | undefined;
      const nextAction = await adaptiveService.getNextAction(userId, careerSlug);
      res.status(200).json({ status: 'success', data: nextAction });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/adaptive/skill-states
 * Retrieves all current authoritative SkillStates for the learner.
 */
router.get(
  '/skill-states',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const states = await skillInferenceService.getLearnerSkillStates(userId);
      res.status(200).json({ status: 'success', data: states });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
