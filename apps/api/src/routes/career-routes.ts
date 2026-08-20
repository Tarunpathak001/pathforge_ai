import { Router, Request, Response, NextFunction } from 'express';
import { careerService } from '../services/career-service.js';
import { CareerQuerySchema } from '@pathforge/shared';

const router = Router();

/**
 * GET /api/careers
 * List all careers with optional query filtering (?category, ?difficulty, ?demandLevel, ?search)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = CareerQuerySchema.parse(req.query);
    const careers = await careerService.getCareers(query);

    res.status(200).json({
      status: 'success',
      results: careers.length,
      data: careers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/careers/:slug
 * Retrieve single career detail with grouped skills and prerequisite graph
 */
router.get('/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const career = await careerService.getCareerBySlug(slug);

    if (!career) {
      res.status(404).json({
        status: 'fail',
        message: `Career with slug '${slug}' not found`,
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: career,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/careers/:slug/skills
 * Retrieve full skill profile for a career
 */
router.get(
  '/:slug/skills',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const skills = await careerService.getCareerSkills(slug);

      if (!skills) {
        res.status(404).json({
          status: 'fail',
          message: `Career with slug '${slug}' not found`,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        results: skills.length,
        data: skills,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
