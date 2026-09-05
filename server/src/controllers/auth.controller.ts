// Auth Controller
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email || 'admin@apexretail.com', password || 'password');
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id || 'usr-101';
    const profile = await authService.getProfile(userId);
    sendSuccess(res, profile, 'User profile fetched');
  } catch (err) {
    next(err);
  }
}
