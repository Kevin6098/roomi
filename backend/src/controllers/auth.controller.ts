import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const { user, token } = await authService.login(email, password);
  res.json({ user, token });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = (req as Request & { user?: authService.AuthUser }).user;
  res.json({ user: user! });
}
