// Sales Controller
import { Request, Response, NextFunction } from 'express';
import { salesService } from '../services/sales.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sales = await salesService.getSales();
    sendSuccess(res, sales, 'Sales transactions retrieved');
  } catch (err) {
    next(err);
  }
}

export async function createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sale = await salesService.createSale(req.body);
    sendSuccess(res, sale, 'POS Transaction processed successfully', 201);
  } catch (err) {
    next(err);
  }
}
