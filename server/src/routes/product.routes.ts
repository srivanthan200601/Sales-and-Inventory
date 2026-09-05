// Product Routes
import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/product.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';

export const productRouter = Router();

productRouter.get('/', authenticateJWT, getProducts);
productRouter.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'STORE_MANAGER'), createProduct);
