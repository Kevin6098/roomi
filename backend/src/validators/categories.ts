import { z } from 'zod';

const nameEnSchema = z.string().min(1, 'Name (EN) is required').max(100).trim();
const nameJaSchema = z.string().max(100).trim().optional().nullable();

export const createMainCategorySchema = z.object({
  name_en: nameEnSchema,
  name_ja: nameJaSchema,
});

export const updateMainCategorySchema = z.object({
  name_en: nameEnSchema.optional(),
  name_ja: nameJaSchema,
});

export const createSubCategorySchema = z.object({
  main_category_id: z.string().min(1),
  name_en: nameEnSchema,
  name_ja: nameJaSchema,
});

export const updateSubCategorySchema = z.object({
  name_en: nameEnSchema.optional(),
  name_ja: nameJaSchema,
});

export type CreateMainCategoryBody = z.infer<typeof createMainCategorySchema>;
export type UpdateMainCategoryBody = z.infer<typeof updateMainCategorySchema>;
export type CreateSubCategoryBody = z.infer<typeof createSubCategorySchema>;
export type UpdateSubCategoryBody = z.infer<typeof updateSubCategorySchema>;
