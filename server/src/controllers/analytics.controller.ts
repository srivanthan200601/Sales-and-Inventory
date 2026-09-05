// Analytics Controller
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.js';

export async function getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const metrics = {
      todayRevenue: 14850.50,
      grossProfitMarginPercent: 38.2,
      activeLowStockAlertsCount: 4,
      totalTrackedSkusCount: 8
    };
    sendSuccess(res, metrics, 'Dashboard summary metrics fetched');
  } catch (err) {
    next(err);
  }
}
