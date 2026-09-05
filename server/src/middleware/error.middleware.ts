// Global Error Handler Middleware
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error(`[Error Middleware] ${err.message}`, { stack: err.stack, path: req.path });

  if (err instanceof AppError) {
    sendError(res, err.message, err.code, err.statusCode);
    return;
  }

  sendError(res, 'Internal Server Error', 'INTERNAL_SERVER_ERROR', 500, process.env.NODE_ENV === 'development' ? err.stack : undefined);
}
