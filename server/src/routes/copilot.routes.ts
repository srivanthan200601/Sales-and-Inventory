// AI Copilot Routes
import { Router } from 'express';
import { processChatPrompt } from '../controllers/copilot.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

export const copilotRouter = Router();

copilotRouter.post('/chat', authenticateJWT, processChatPrompt);
