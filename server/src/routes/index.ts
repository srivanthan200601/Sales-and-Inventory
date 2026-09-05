// Master API Router (/api/v1)
import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { productRouter } from './product.routes.js';
import { inventoryRouter } from './inventory.routes.js';
import { salesRouter } from './sales.routes.js';
import { supplierRouter } from './supplier.routes.js';
import { analyticsRouter } from './analytics.routes.js';
import { copilotRouter } from './copilot.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/sales', salesRouter);
apiRouter.use('/suppliers', supplierRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/copilot', copilotRouter);
