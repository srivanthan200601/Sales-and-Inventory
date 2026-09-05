// Supplier Controller
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.js';

export async function getSuppliers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const suppliers = [
      { id: 'sup-1', name: 'TechDistro Global Inc', contact: 'Sarah Jenkins', leadTimeDays: 3, reliability: '98%' },
      { id: 'sup-2', name: 'Urban Apparel Logistics', contact: 'David Vance', leadTimeDays: 5, reliability: '94%' }
    ];
    sendSuccess(res, suppliers, 'Supplier directory retrieved');
  } catch (err) {
    next(err);
  }
}
