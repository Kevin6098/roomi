import { z } from 'zod';

const saleDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createSaleSchema = z.object({
  item_id: z.string().min(1),
  customer_id: z.string().min(1),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  sale_date: saleDateSchema,
  platform_sold: z.string().max(100).trim().optional().nullable(),
  handover_location: z.string().max(255).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateSaleSchema = z.object({
  sale_price: z.coerce.number().min(0).optional().nullable(),
  sale_date: saleDateSchema.optional(),
  platform_sold: z.string().max(100).trim().optional().nullable(),
  handover_location: z.string().max(255).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateSaleBody = z.infer<typeof createSaleSchema>;
export type UpdateSaleBody = z.infer<typeof updateSaleSchema>;
