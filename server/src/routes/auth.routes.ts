// Auth Routes
import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/me', authenticateJWT, getProfile);
