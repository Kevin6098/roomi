import { z } from 'zod';

const contactPayloadSchema = z.object({
  source_platform: z.string().min(1).max(50).trim(),
  name: z.string().min(1).max(120).trim(),
  platform_user_id: z.string().max(120).trim().optional().nullable(),
  phone: z.string().max(40).trim().optional().nullable(),
  email: z.string().email().max(120).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const reserveItemSchema = z.object({
  contact_id: z.string().min(1).optional().nullable(),
  contact: contactPayloadSchema.optional(),
  reserve_type: z.enum(['sale', 'rental']),
  deposit_expected: z.coerce.number().min(0).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
}).refine(
  (data) => (data.contact_id != null && data.contact_id !== '') || data.contact != null,
  { message: 'Either contact_id or contact is required to link the reservation to a person.' }
);

export const depositReceivedSchema = z.object({
  deposit_received: z.literal(true),
  deposit_received_at: z.string().optional().nullable(),
});

export const cancelReservationSchema = z.object({
  reason: z.string().optional().nullable(),
});

export type ReserveItemBody = z.infer<typeof reserveItemSchema>;
export type DepositReceivedBody = z.infer<typeof depositReceivedSchema>;
export type CancelReservationBody = z.infer<typeof cancelReservationSchema>;
