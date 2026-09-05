// Server Startup Entrypoint
import { createApp } from './app.js';
import { env } from './config/env.js';
import { db } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    await db.connect();
    const app = createApp();

    const port = parseInt(env.PORT, 10) || 5000;
    app.listen(port, () => {
      logger.info(`[Server] Retail Copilot API running at http://localhost:${port}${env.API_PREFIX}`);
      logger.info(`[Server] Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    logger.error('[Server Bootstrap Error]', error);
    process.exit(1);
  }
}

bootstrap();
