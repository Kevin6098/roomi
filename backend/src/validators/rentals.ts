import { z } from 'zod';
import { createContactSchema } from './contacts.js';

const rentPeriodEnum = z.enum(['monthly', 'annually']);

export const startRentalSchema = z.object({
  item_id: z.string().min(1),
  customer_id: z.string().min(1).optional().nullable(),
  contact_id: z.string().min(1).optional().nullable(),
  contact: createContactSchema.optional(),
  rent_period: rentPeriodEnum.optional().default('monthly'),
  rent_price_monthly: z.coerce.number().min(0).optional().nullable(),
  rent_price_annually: z.coerce.number().min(0).optional().nullable(),
  deposit: z.coerce.number().min(0).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expected_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  { message: 'Handover location is required for rental: please select prefecture, city, and enter exact location.' }
);

export const endRentalSchema = z.object({
  actual_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  damage_fee: z.coerce.number().min(0).optional().nullable(),
  next_item_status: z.enum(['in_stock', 'disposed']),
  notes: z.string().optional().nullable(),
});

export const setDamageSchema = z.object({
  damage_fee: z.coerce.number().min(0),
});

export type StartRentalBody = z.infer<typeof startRentalSchema>;
export type EndRentalBody = z.infer<typeof endRentalSchema>;
export type SetDamageBody = z.infer<typeof setDamageSchema>;
