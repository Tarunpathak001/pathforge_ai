import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or local
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const defaultDbPath = path.resolve(
  process.cwd(),
  process.cwd().endsWith('api') ? 'prisma/dev.db' : 'apps/api/prisma/dev.db'
);

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || `file:${defaultDbPath.replace(/\\/g, '/')}`,
};
