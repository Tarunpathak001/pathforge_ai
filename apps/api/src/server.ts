import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.info(
    `[PathForge API] Server listening on http://localhost:${config.port} (env: ${config.env})`
  );
  console.info(`[PathForge API] AI Service URL: ${config.aiServiceUrl}`);
});

process.on('SIGTERM', () => {
  console.info('[PathForge API] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.info('[PathForge API] Process terminated');
  });
});
