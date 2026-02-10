import { z } from 'zod';

const roleEnum = z.enum(['OWNER', 'STAFF']);

export const createUserSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: roleEnum.optional().default('STAFF'),
});

export const updateUserSchema = z.object({
  email: z.string().email().trim().toLowerCase().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: roleEnum.optional(),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
