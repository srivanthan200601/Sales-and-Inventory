// Inventory Controller
import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await inventoryService.getInventory();
    sendSuccess(res, items, 'Inventory matrix retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alerts = await inventoryService.getLowStockAlerts();
    sendSuccess(res, alerts, 'Active low-stock alerts retrieved');
  } catch (err) {
    next(err);
  }
}

export async function adjustStock(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId, qtyChange, reason } = req.body;
    const item = await inventoryService.adjustStock(productId, qtyChange, reason || 'Manual Adjustment');
    sendSuccess(res, item, 'Stock adjustment saved');
  } catch (err) {
    next(err);
  }
}
