import { prisma } from '../db.js';
import { conflict, notFound } from '../utils/errors.js';
import * as authService from './auth.service.js';
import type { CreateUserBody, UpdateUserBody } from '../validators/users.js';

function omitPassword<T extends { passwordHash?: string }>(u: T) {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

export const userService = {
  async getMany() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return users.map(omitPassword);
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound('User not found');
    return omitPassword(user);
  },

  async create(body: CreateUserBody) {
    const email = body.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw conflict('Email already in use');
    const passwordHash = await authService.hashPassword(body.password);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: body.role },
    });
    return omitPassword(user);
  },

  async update(id: string, body: UpdateUserBody) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound('User not found');
    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (existing) throw conflict('Email already in use');
    }
    const data: { email?: string; passwordHash?: string; role?: 'OWNER' | 'STAFF' } = {};
    if (body.email !== undefined) data.email = body.email.trim().toLowerCase();
    if (body.password !== undefined) data.passwordHash = await authService.hashPassword(body.password);
    if (body.role !== undefined) data.role = body.role;
    const updated = await prisma.user.update({
      where: { id },
      data,
    });
    return omitPassword(updated);
  },

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound('User not found');
    await prisma.user.delete({ where: { id } });
  },
};
