// Standard API Response Envelopes
import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, message: string = 'Success', status: number = 200): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(status).json(payload);
}

export function sendError(res: Response, message: string, code: string = 'INTERNAL_ERROR', status: number = 500, details?: any): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      details
    },
    message
  };
  return res.status(status).json(payload);
}
