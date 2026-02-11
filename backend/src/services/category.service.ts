import { prisma } from '../db.js';
import { conflict, notFound } from '../utils/errors.js';
import type {
  CreateMainCategoryBody,
  UpdateMainCategoryBody,
  CreateSubCategoryBody,
  UpdateSubCategoryBody,
} from '../validators/categories.js';

export const categoryService = {
  async getMain() {
    return prisma.mainCategory.findMany({ orderBy: { name: 'asc' } });
  },

  async getMainById(id: string) {
    const main = await prisma.mainCategory.findUnique({
      where: { id },
      include: { subCategories: { orderBy: { name: 'asc' } } },
    });
    if (!main) throw notFound('Main category not found');
    const subs = main.subCategories;
    const other = subs.filter((s) => s.name.toLowerCase() === 'other');
    const rest = subs.filter((s) => s.name.toLowerCase() !== 'other');
    return { ...main, subCategories: [...rest, ...other] };
  },

  async getSubByMainId(mainId: string) {
    const list = await prisma.subCategory.findMany({
      where: { mainCategoryId: mainId },
      orderBy: { name: 'asc' },
      include: { mainCategory: true },
    });
    // "other" always at the bottom
    const other = list.filter((s) => s.name.toLowerCase() === 'other');
    const rest = list.filter((s) => s.name.toLowerCase() !== 'other');
    return [...rest, ...other];
  },

  async getSubById(id: string) {
    const sub = await prisma.subCategory.findUnique({
      where: { id },
      include: { mainCategory: true },
    });
    if (!sub) throw notFound('Subcategory not found');
    return sub;
  },

  async getAllSubs() {
    return prisma.subCategory.findMany({
      orderBy: [{ mainCategory: { name: 'asc' } }, { name: 'asc' }],
      include: { mainCategory: true },
    });
  },

  async createMain(body: CreateMainCategoryBody) {
    const name = (body.name_en || '').trim() || 'unnamed';
    const existing = await prisma.mainCategory.findUnique({ where: { name } });
    if (existing) throw conflict('A category with this name already exists');
    return prisma.mainCategory.create({
      data: {
        name,
        nameEn: name || null,
        nameJa: body.name_ja?.trim() || null,
      },
    });
  },

  async updateMain(id: string, body: UpdateMainCategoryBody) {
    const main = await prisma.mainCategory.findUnique({ where: { id } });
    if (!main) throw notFound('Main category not found');
    const name = (body.name_en ?? main.nameEn ?? main.name).trim() || main.name;
    const existing = await prisma.mainCategory.findFirst({ where: { name, NOT: { id } } });
    if (existing) throw conflict('A category with this name already exists');
    const data: { name: string; nameEn?: string | null; nameJa?: string | null } = { name };
    if (body.name_en !== undefined) data.nameEn = body.name_en.trim() || null;
    if (body.name_ja !== undefined) data.nameJa = body.name_ja?.trim() || null;
    return prisma.mainCategory.update({ where: { id }, data });
  },

  async deleteMain(id: string) {
    const main = await prisma.mainCategory.findUnique({
      where: { id },
      include: { _count: { select: { subCategories: true } } },
    });
    if (!main) throw notFound('Main category not found');
    if (main._count.subCategories > 0) throw conflict('Delete subcategories first');
    await prisma.mainCategory.delete({ where: { id } });
  },

  async createSub(body: CreateSubCategoryBody) {
    const name = (body.name_en || '').trim() || 'unnamed';
    const main = await prisma.mainCategory.findUnique({ where: { id: body.main_category_id } });
    if (!main) throw notFound('Main category not found');
    const existing = await prisma.subCategory.findUnique({
      where: { mainCategoryId_name: { mainCategoryId: body.main_category_id, name } },
    });
    if (existing) throw conflict('A subcategory with this name already exists in this category');
    return prisma.subCategory.create({
      data: {
        mainCategoryId: body.main_category_id,
        name,
        nameEn: name || null,
        nameJa: body.name_ja?.trim() || null,
      },
      include: { mainCategory: true },
    });
  },

  async updateSub(id: string, body: UpdateSubCategoryBody) {
    const sub = await prisma.subCategory.findUnique({ where: { id } });
    if (!sub) throw notFound('Subcategory not found');
    const name = (body.name_en ?? sub.nameEn ?? sub.name).trim() || sub.name;
    const existing = await prisma.subCategory.findFirst({
      where: {
        mainCategoryId: sub.mainCategoryId,
        name,
        NOT: { id },
      },
    });
    if (existing) throw conflict('A subcategory with this name already exists in this category');
    const data: { name: string; nameEn?: string | null; nameJa?: string | null } = { name };
    if (body.name_en !== undefined) data.nameEn = body.name_en.trim() || null;
    if (body.name_ja !== undefined) data.nameJa = body.name_ja?.trim() || null;
    return prisma.subCategory.update({
      where: { id },
      data,
      include: { mainCategory: true },
    });
  },

  async deleteSub(id: string) {
    const sub = await prisma.subCategory.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!sub) throw notFound('Subcategory not found');
    if (sub._count.items > 0) throw conflict('Cannot delete: subcategory has items');
    await prisma.subCategory.delete({ where: { id } });
  },
};
