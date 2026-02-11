import { z } from 'zod';

export const createListingSchema = z.object({
  platform: z.string().min(1).max(50).trim(),
  listing_url: z.string().max(255).trim().optional().nullable(),
  listing_ref_id: z.string().max(120).trim().optional().nullable(),
});

export const updateListingSchema = z.object({
  platform: z.string().min(1).max(50).trim().optional(),
  listing_url: z.string().max(255).trim().optional().nullable(),
  listing_ref_id: z.string().max(120).trim().optional().nullable(),
  status: z.enum(['active', 'needs_update', 'closed']).optional(),
});

export const setListedFlagSchema = z.object({
  is_listed: z.boolean(),
});

export const confirmListingsUpdatedSchema = z.object({
  listing_ids: z.array(z.string().min(1)).min(1),
  action: z.enum(['sold', 'rented', 'deleted']),
});

export type CreateListingBody = z.infer<typeof createListingSchema>;
export type UpdateListingBody = z.infer<typeof updateListingSchema>;
export type SetListedFlagBody = z.infer<typeof setListedFlagSchema>;
export type ConfirmListingsUpdatedBody = z.infer<typeof confirmListingsUpdatedSchema>;
