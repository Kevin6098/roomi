import { z } from 'zod';

const itemStatusEnum = z.enum(['in_stock', 'listed', 'reserved', 'rented', 'sold', 'disposed']);
const conditionEnum = z.enum(['new', 'good', 'fair', 'poor']);
const acquisitionTypeEnum = z.enum(['free', 'cheap', 'bought']);

export const createItemSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  sub_category_id: z.string().min(1),
  source_platform: z.string().max(100).trim().optional().nullable(),
  acquisition_type: acquisitionTypeEnum.optional().default('bought'),
  acquisition_cost: z.coerce.number().min(0).optional().default(0),
  original_price: z.coerce.number().min(0).optional().nullable(),
  condition: conditionEnum.optional().default('good'),
  location_area: z.string().max(100).trim().optional().nullable(),
  exact_location: z.string().max(255).trim().optional().nullable(),
  status: itemStatusEnum.optional().default('in_stock'),
  acquisition_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateItemSchema = createItemSchema.partial();

export const reserveItemSchema = z.object({
  customer_id: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export type CreateItemBody = z.infer<typeof createItemSchema>;
export type UpdateItemBody = z.infer<typeof updateItemSchema>;
export type ReserveItemBody = z.infer<typeof reserveItemSchema>;
