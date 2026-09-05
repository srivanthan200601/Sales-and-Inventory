// Analytics Routes
import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/analytics.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware.js';

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'STORE_MANAGER', 'AUDITOR'), getDashboardMetrics);
