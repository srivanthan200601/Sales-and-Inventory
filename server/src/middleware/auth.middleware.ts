// Authentication & Authorization (RBAC) Middleware
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { UserRole } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    storeId?: string;
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For Phase 1 demo mode, mock user context if header missing
    req.user = {
      id: 'usr-101',
      email: 'alex.morgan@apexretail.com',
      role: 'STORE_MANAGER',
      storeId: 'store-101'
    };
    return next();
  }

  // Parse JWT token
  req.user = {
    id: 'usr-101',
    email: 'alex.morgan@apexretail.com',
    role: 'STORE_MANAGER',
    storeId: 'store-101'
  };
  next();
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Role ${req.user.role} does not have access to this resource`));
    }
    next();
  };
}
