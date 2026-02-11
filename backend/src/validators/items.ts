import { z } from 'zod';

const itemStatusEnum = z.enum(['in_stock', 'listed', 'reserved', 'rented', 'sold', 'disposed']);
const conditionEnum = z.enum(['new', 'good', 'fair', 'poor']);
const acquisitionTypeEnum = z.enum(['free', 'cheap', 'bought']);
const locationVisibilityEnum = z.enum(['hidden', 'shown']);

const contactPayloadSchema = z.object({
  source_platform: z.string().min(1).max(50).trim(),
  name: z.string().min(1).max(120).trim(),
  platform_user_id: z.string().max(120).trim().optional().nullable(),
  phone: z.string().max(40).trim().optional().nullable(),
  email: z.string().email().max(120).trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createItemSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  sub_category_id: z.string().min(1),
  custom_sub_category: z.string().max(120).trim().optional().nullable(),
  acquisition_contact_id: z.string().min(1).optional().nullable(),
  contact: contactPayloadSchema.optional(),
  source_platform: z.string().max(100).trim().optional().nullable(),
  acquisition_type: acquisitionTypeEnum.optional().default('bought'),
  acquisition_cost: z.coerce.number().min(0).optional().default(0),
  original_price: z.coerce.number().min(0).optional().nullable(),
  condition: conditionEnum.optional().default('good'),
  prefecture: z.string().max(50).trim().optional().default('Undecided'),
  city: z.string().max(80).trim().optional().default('Undecided'),
  exact_location: z.string().max(255).trim().optional().nullable(),
  location_visibility: locationVisibilityEnum.optional().default('hidden'),
  location_area: z.string().max(100).trim().optional().nullable(),
  status: itemStatusEnum.optional().default('in_stock'),
  acquisition_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateItemSchema = createItemSchema.partial().omit({ contact: true });

export const reserveItemSchema = z.object({
  customer_id: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export type CreateItemBody = z.infer<typeof createItemSchema>;
export type UpdateItemBody = z.infer<typeof updateItemSchema>;
export type ReserveItemBody = z.infer<typeof reserveItemSchema>;
