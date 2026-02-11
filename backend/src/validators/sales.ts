import { z } from 'zod';
import { createContactSchema } from './contacts.js';

const saleDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createSaleSchema = z.object({
  item_id: z.string().min(1),
  customer_id: z.string().min(1).optional().nullable(),
  contact_id: z.string().min(1).optional().nullable(),
  contact: createContactSchema.optional(),
  sale_price: z.coerce.number().min(0),
  sale_date: saleDateSchema,
  platform_sold: z.string().max(100).trim().optional().nullable(),
  handover_location: z.string().max(255).trim().optional().nullable(),
  handover_prefecture: z.string().max(50).trim().optional().nullable(),
  handover_city: z.string().max(80).trim().optional().nullable(),
  handover_exact_location: z.string().max(255).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
  payment_received: z.boolean().optional(),
  listing_ids: z.array(z.string().min(1)).optional(),
}).refine(
  (data) => (data.customer_id != null && data.customer_id !== '') || (data.contact_id != null && data.contact_id !== '') || data.contact != null,
  { message: 'Either customer_id, contact_id, or contact is required' }
).refine(
  (data) => {
    const pref = data.handover_prefecture?.trim();
    const city = data.handover_city?.trim();
    const exact = data.handover_exact_location?.trim();
    return pref != null && pref !== '' && pref !== 'Undecided'
      && city != null && city !== '' && city !== 'Undecided'
      && exact != null && exact !== '';
  },
  { message: 'Handover location is required for sale: please select prefecture, city, and enter exact location.' }
);

export const updateSaleSchema = z.object({
  sale_price: z.coerce.number().min(0).optional().nullable(),
  sale_date: saleDateSchema.optional(),
  platform_sold: z.string().max(100).trim().optional().nullable(),
  handover_location: z.string().max(255).trim().optional().nullable(),
  handover_prefecture: z.string().max(50).trim().optional().nullable(),
  handover_city: z.string().max(80).trim().optional().nullable(),
  handover_exact_location: z.string().max(255).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateSaleBody = z.infer<typeof createSaleSchema>;
export type UpdateSaleBody = z.infer<typeof updateSaleSchema>;
