import { Router, Request, Response, NextFunction } from 'express';
import { skillService } from '../services/skill-service.js';
import { SkillQuerySchema, CreatePrerequisiteSchema } from '@pathforge/shared';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

/**
 * GET /api/skills
 * List all skills with optional query filtering (?category, ?skillType, ?search)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = SkillQuerySchema.parse(req.query);
    const skills = await skillService.getSkills(query);

    res.status(200).json({
      status: 'success',
      results: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/:slug
 * Retrieve single skill details with prerequisites, dependents, and target careers
 */
router.get('/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const skill = await skillService.getSkillBySlug(slug);

    if (!skill) {
      res.status(404).json({
        status: 'fail',
        message: `Skill with slug '${slug}' not found`,
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/:slug/prerequisites
 * Retrieve multi-level hierarchical prerequisite tree for a skill
 */
router.get(
  '/:slug/prerequisites',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const tree = await skillService.getSkillPrerequisites(slug);

      if (!tree) {
        res.status(404).json({
          status: 'fail',
          message: `Skill with slug '${slug}' not found`,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/skills/:slug/dependents
 * Retrieve skills that depend on this skill
 */
router.get(
  '/:slug/dependents',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const dependents = await skillService.getSkillDependents(slug);

      if (!dependents) {
        res.status(404).json({
          status: 'fail',
          message: `Skill with slug '${slug}' not found`,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        results: dependents.length,
        data: dependents,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/skills/prerequisites
 * Add a new prerequisite with graph cycle validation
 */
router.post(
  '/prerequisites',
  validateBody(CreatePrerequisiteSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await skillService.addPrerequisite(req.body);
      res.status(201).json({
        status: 'success',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
