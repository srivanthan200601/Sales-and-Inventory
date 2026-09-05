// AI Copilot Controller
import { Request, Response, NextFunction } from 'express';
import { copilotService } from '../services/ai/copilot.service.js';
import { sendSuccess } from '../utils/response.js';

export async function processChatPrompt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { prompt } = req.body;
    const result = await copilotService.processPrompt(prompt || 'Draft purchase order');
    sendSuccess(res, result, 'AI Copilot response generated');
  } catch (err) {
    next(err);
  }
}
