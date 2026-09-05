// Express Application Server Configuration
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app: Express = express();

  // Core Security & Utilities Middlewares
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Health Check Endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      project: 'Retail - Sales and Inventory Copilot (TRACK_DIPHS08)',
      timestamp: new Date().toISOString()
    });
  });

  // Master API V1 Route Mount
  app.use(env.API_PREFIX, apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
