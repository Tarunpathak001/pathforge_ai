import { Router, Request, Response } from 'express';
import { prisma } from '../db/client.js';

export const healthRouter = Router();

/**
 * GET /health
 * Basic liveness check endpoint.
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'pathforge-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

/**
 * GET /health/ready
 * Readiness check verifying database connectivity and database seed status.
 */
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check database responsiveness
    await prisma.$queryRaw`SELECT 1`;

    const [skillCount, careerCount, resourceCount, assessmentCount, demoProfile] = await Promise.all([
      prisma.skill.count(),
      prisma.career.count(),
      prisma.learningResource.count(),
      prisma.assessment.count(),
      prisma.learnerProfile.findUnique({
        where: { userId: 'demo-learner-id' },
        select: { id: true, targetRole: true },
      }),
    ]);

    const latencyMs = Date.now() - startTime;

    const isSeeded = skillCount > 0 && careerCount > 0 && resourceCount > 0;

    res.status(200).json({
      status: 'ready',
      database: 'connected',
      latencyMs,
      timestamp: new Date().toISOString(),
      dataset: {
        skills: skillCount,
        careers: careerCount,
        learningResources: resourceCount,
        assessments: assessmentCount,
        seeded: isSeeded,
        demoLearnerReady: !!demoProfile,
      },
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message || 'Database readiness check failed',
      timestamp: new Date().toISOString(),
    });
  }
});
