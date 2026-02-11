import { z } from 'zod';

export const createContactSchema = z.object({
  source_platform: z.string().min(1).max(50).trim(),
  name: z.string().min(1).max(120).trim(),
  platform_user_id: z.string().max(120).trim().optional().nullable(),
  phone: z.string().max(40).trim().optional().nullable(),
  email: z.string().email().max(120).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactBody = z.infer<typeof createContactSchema>;
export type UpdateContactBody = z.infer<typeof updateContactSchema>;
