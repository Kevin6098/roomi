import { Request, Response, NextFunction } from 'express';

export type ApiError = Error & { statusCode?: number; code?: string };

export function errorMiddleware(err: ApiError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = err.message ?? 'Internal server error';
  console.error(err);
  res.status(statusCode).json({ error: message, code });
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}
