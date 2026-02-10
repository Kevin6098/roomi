import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { unauthorized } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: authService.AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(unauthorized('Missing or invalid token'));
    return;
  }
  const token = authHeader.slice(7);
  try {
    req.user = authService.verifyToken(token);
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}

export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'OWNER') {
    next(unauthorized('Admin only'));
    return;
  }
  next();
}
