// Sales Routes
import { Router } from 'express';
import { getSales, createSale } from '../controllers/sales.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';

export const salesRouter = Router();

salesRouter.get('/', authenticateJWT, getSales);
salesRouter.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER'), createSale);
