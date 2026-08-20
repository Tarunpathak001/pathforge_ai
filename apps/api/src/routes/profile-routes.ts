import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middlewares/validate.js';
import { profileService } from '../services/profile-service.js';
import { extractProfileWithAI } from '../services/ai-client.js';
import {
  CreateLearnerProfileSchema,
  UpdateLearnerProfileSchema,
  BulkSkillsInputSchema,
  LearnerSkillInputSchema,
  ProjectInputSchema,
  LearningExperienceInputSchema,
  CertificationInputSchema,
  InterestsBatchInputSchema,
  AIExtractionRequestSchema,
} from '@pathforge/shared';

const router = Router();

// Helper to get active user ID (defaults to 'default-learner-id' if unauthenticated in Phase 1)
function getActiveUserId(req: Request): string {
  const headerUser = req.headers['x-user-id'] as string;
  return headerUser || (req.query.userId as string) || 'default-learner-id';
}

/**
 * AI Extraction Endpoint
 * POST /api/profile/ai-extract
 */
router.post(
  '/ai-extract',
  validateBody(AIExtractionRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const extracted = await extractProfileWithAI(req.body);
      res.status(200).json({
        status: 'success',
        data: extracted,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/profile
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getActiveUserId(req);
    const profile = await profileService.getProfileByUserId(userId);

    if (!profile) {
      res.status(404).json({
        status: 'fail',
        message: 'Profile not found. Please complete onboarding.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/profile
 */
router.post(
  '/',
  validateBody(CreateLearnerProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.body.userId || getActiveUserId(req);
      const profile = await profileService.createOrUpdateProfile({
        ...req.body,
        userId,
      });

      res.status(201).json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/profile
 */
router.patch(
  '/',
  validateBody(UpdateLearnerProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getActiveUserId(req);
      const updated = await profileService.updateProfile(userId, req.body);

      res.status(200).json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/profile
 */
router.delete('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getActiveUserId(req);
    const deleted = await profileService.deleteProfile(userId);

    res.status(200).json({
      status: 'success',
      message: deleted ? 'Profile deleted successfully' : 'No profile to delete',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/completeness
 */
router.get(
  '/completeness',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getActiveUserId(req);
      const completeness = await profileService.getCompleteness(userId);

      res.status(200).json({
        status: 'success',
        data: completeness,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * SKILLS ROUTES
 * POST /api/profile/skills
 */
router.post('/skills', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getActiveUserId(req);
    let skillsList: any[] = [];

    if (req.body.skills && Array.isArray(req.body.skills)) {
      skillsList = BulkSkillsInputSchema.parse(req.body).skills;
    } else {
      skillsList = [LearnerSkillInputSchema.parse(req.body)];
    }

    const created = await profileService.addSkills(userId, skillsList);
    res.status(201).json({
      status: 'success',
      data: created,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/profile/skills/:id
 */
router.patch(
  '/skills/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const skill = await profileService.updateSkill(id, req.body);
      res.status(200).json({
        status: 'success',
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/profile/skills/:id
 */
router.delete(
  '/skills/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await profileService.deleteSkill(id);
      res.status(200).json({
        status: 'success',
        message: 'Skill deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PROJECTS ROUTES
 * POST /api/profile/projects
 */
router.post(
  '/projects',
  validateBody(ProjectInputSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getActiveUserId(req);
      const project = await profileService.addProject(userId, req.body);
      res.status(201).json({
        status: 'success',
        data: {
          ...project,
          technologies: project.technologies ? JSON.parse(project.technologies) : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/profile/projects/:id
 */
router.patch(
  '/projects/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await profileService.updateProject(id, req.body);
      res.status(200).json({
        status: 'success',
        data: {
          ...updated,
          technologies: updated.technologies ? JSON.parse(updated.technologies) : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/profile/projects/:id
 */
router.delete(
  '/projects/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await profileService.deleteProject(id);
      res.status(200).json({
        status: 'success',
        message: 'Project deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * LEARNING HISTORY ROUTES
 * POST /api/profile/learning
 */
router.post(
  '/learning',
  validateBody(LearningExperienceInputSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getActiveUserId(req);
      const learning = await profileService.addLearning(userId, req.body);
      res.status(201).json({
        status: 'success',
        data: learning,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/profile/learning/:id
 */
router.patch(
  '/learning/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await profileService.updateLearning(id, req.body);
      res.status(200).json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/profile/learning/:id
 */
router.delete(
  '/learning/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await profileService.deleteLearning(id);
      res.status(200).json({
        status: 'success',
        message: 'Learning experience deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * CERTIFICATIONS ROUTES
 * POST /api/profile/certifications
 */
router.post(
  '/certifications',
  validateBody(CertificationInputSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getActiveUserId(req);
      const cert = await profileService.addCertification(userId, req.body);
      res.status(201).json({
        status: 'success',
        data: cert,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/profile/certifications/:id
 */
router.patch(
  '/certifications/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const updated = await profileService.updateCertification(id, req.body);
      res.status(200).json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/profile/certifications/:id
 */
router.delete(
  '/certifications/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await profileService.deleteCertification(id);
      res.status(200).json({
        status: 'success',
        message: 'Certification deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * INTERESTS ROUTES
 * POST /api/profile/interests
 */
router.post(
  '/interests',
  validateBody(InterestsBatchInputSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getActiveUserId(req);
      const interests = await profileService.setInterests(userId, req.body.interests);
      res.status(200).json({
        status: 'success',
        data: interests,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
