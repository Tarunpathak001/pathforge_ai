import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import profileRoutes from './routes/profile-routes.js';
import careerRoutes from './routes/career-routes.js';
import skillRoutes from './routes/skill-routes.js';
import { errorHandler } from './middlewares/error-handler.js';

export function createApp(): Express {
  const app = express();

  // Security & Logging
  app.use(helmet());
  app.use(
    cors({
      origin: '*', // Allow local frontend during development
      credentials: true,
    })
  );
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Request limits (prevent excessively large payloads)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    });
  });

  // API Routes
  app.use('/api/profile', profileRoutes);
  app.use('/api/careers', careerRoutes);
  app.use('/api/skills', skillRoutes);

  // 404 Fallback
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      status: 'fail',
      message: `Route ${req.originalUrl} not found`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
