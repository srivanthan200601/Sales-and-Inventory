// Inventory Routes
import { Router } from 'express';
import { getInventory, getAlerts, adjustStock } from '../controllers/inventory.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';

export const inventoryRouter = Router();

inventoryRouter.get('/', authenticateJWT, getInventory);
inventoryRouter.get('/alerts', authenticateJWT, getAlerts);
inventoryRouter.post('/adjustment', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_SPECIALIST'), adjustStock);
