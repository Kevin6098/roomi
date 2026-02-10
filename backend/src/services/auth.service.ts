import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { config } from '../config/index.js';
import { unauthorized } from '../utils/errors.js';

const SALT_ROUNDS = 10;

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw unauthorized('Invalid email or password');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw unauthorized('Invalid email or password');
  const payload: AuthUser = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
  return { user: payload, token };
}

export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
  return decoded;
}
