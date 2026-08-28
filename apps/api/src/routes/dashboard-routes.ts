import { Router, Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard-service.js';
import {
  DashboardQuerySchema,
  SwitchDashboardCareerSchema,
} from '@pathforge/shared';

const router = Router();

function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * GET /api/dashboard
 * Retrieves the aggregated Command Center dashboard payload.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    const parsed = DashboardQuerySchema.parse(req.query);
    const summary = await dashboardService.getDashboardSummary(
      userId,
      parsed.careerSlug,
      parsed.refresh
    );
    res.status(200).json({ status: 'success', data: summary });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/dashboard/switch-career
 * Switches target career role and recalculates dashboard alignment.
 */
router.post(
  '/switch-career',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const parsed = SwitchDashboardCareerSchema.parse(req.body);
      const summary = await dashboardService.switchTargetCareer(
        userId,
        parsed.careerSlug,
        parsed.autoRecalculate
      );
      res.status(200).json({ status: 'success', data: summary });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
