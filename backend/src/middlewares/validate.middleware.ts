import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export function validateBody<T>(schema: { parse: (data: unknown) => T }) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const msg = e.errors.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ');
        next(new AppError(msg, 400, 'VALIDATION_ERROR'));
      } else {
        next(e);
      }
    }
  };
}

export function validateQuery<T>(schema: { parse: (data: unknown) => T }) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as Request['query'];
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const msg = e.errors.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ');
        next(new AppError(msg, 400, 'VALIDATION_ERROR'));
      } else {
        next(e);
      }
    }
  };
}
