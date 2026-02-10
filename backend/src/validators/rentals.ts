import { z } from 'zod';

export const startRentalSchema = z.object({
  item_id: z.string().min(1),
  customer_id: z.string().min(1),
  rent_price_monthly: z.coerce.number().min(0).optional().nullable(),
  deposit: z.coerce.number().min(0).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expected_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  handover_location: z.string().max(255).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const endRentalSchema = z.object({
  actual_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  damage_fee: z.coerce.number().min(0).optional().nullable(),
  next_item_status: z.enum(['in_stock', 'listed', 'disposed']),
  notes: z.string().optional().nullable(),
});

export const setDamageSchema = z.object({
  damage_fee: z.coerce.number().min(0),
});

export type StartRentalBody = z.infer<typeof startRentalSchema>;
export type EndRentalBody = z.infer<typeof endRentalSchema>;
export type SetDamageBody = z.infer<typeof setDamageSchema>;
