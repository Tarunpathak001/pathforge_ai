import { Router, Request, Response, NextFunction } from 'express';
import { skillGapService } from '../services/skill-gap-service.js';
import { AnalyzeSkillGapInputSchema, SkillGapQuerySchema } from '@pathforge/shared';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

function getActiveUserId(req: Request): string {
  const headerUser = req.headers['x-user-id'] as string;
  return headerUser || (req.query.userId as string) || 'default-learner-id';
}

/**
 * POST /api/skill-gap/analyze
 * Run a fresh deterministic skill gap analysis for the active learner against a target career
 */
router.post(
  '/analyze',
  validateBody(AnalyzeSkillGapInputSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getActiveUserId(req);
      const report = await skillGapService.analyzeCareerGap(userId, req.body);

      res.status(200).json({
        status: 'success',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/skill-gap/latest
 * Retrieve the latest saved analysis for the learner (or auto-generate one)
 */
router.get('/latest', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getActiveUserId(req);
    const careerSlug = req.query.careerSlug as string | undefined;
    const report = await skillGapService.getLatestAnalysis(userId, careerSlug);

    if (!report) {
      res.status(404).json({
        status: 'fail',
        message: 'No skill gap analysis found. Please run an analysis first.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skill-gap/:id
 * Retrieve a specific analysis report by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getActiveUserId(req);
    const id = req.params.id as string;
    const report = await skillGapService.getAnalysisById(userId, id);

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skill-gap
 * List analysis history for the active learner
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getActiveUserId(req);
    const query = SkillGapQuerySchema.parse(req.query);
    const history = await skillGapService.getUserAnalyses(userId, query.limit);

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
