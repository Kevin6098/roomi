import { z } from 'zod';

const preferredLanguageEnum = z.enum(['en', 'jp', 'cn']);

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  phone: z.string().max(50).trim().optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  preferred_language: preferredLanguageEnum.optional().default('en'),
  source_platform: z.string().max(100).trim().optional().nullable(),
  app_id: z.string().max(100).trim().optional().nullable(),
  prefecture: z.string().max(50).trim().optional().nullable(),
  city: z.string().max(80).trim().optional().nullable(),
  exact_location: z.string().max(255).trim().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerBody = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerBody = z.infer<typeof updateCustomerSchema>;
