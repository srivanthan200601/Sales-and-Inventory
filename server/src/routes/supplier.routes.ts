// Supplier Routes
import { Router } from 'express';
import { getSuppliers } from '../controllers/supplier.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

export const supplierRouter = Router();

supplierRouter.get('/', authenticateJWT, getSuppliers);
