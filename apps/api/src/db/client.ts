import { PrismaClient } from '@prisma/client';
import { config } from '../config/env.js';

// Ensure process.env.DATABASE_URL is defined for Prisma internals
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = config.databaseUrl;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
