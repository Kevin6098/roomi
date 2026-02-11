import { ItemStatus, Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { conflict, notFound, validationError } from '../utils/errors.js';
import type { CreateItemBody, UpdateItemBody } from '../validators/items.js';
import { contactService } from './contact.service.js';

const itemInclude = {
  subCategory: { include: { mainCategory: true } },
  acquisitionContact: true,
} as const;

type ItemWithInclude = Awaited<ReturnType<typeof prisma.item.findFirst>> & { subCategory?: { name: string; mainCategory?: { name: string } } };
function withDisplaySubCategory<T extends ItemWithInclude>(item: T): T & { displaySubCategory: string } {
  const display = item.customSubCategory ?? item.subCategory?.name ?? '—';
  return { ...item, displaySubCategory: display };
}
function withDisplaySubCategoryList<T extends ItemWithInclude>(items: T[]): (T & { displaySubCategory: string })[] {
  return items.map(withDisplaySubCategory);
}

export const itemService = {
  async getCounts() {
    const counts = await prisma.item.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const map: Record<string, number> = {};
    for (const s of ['in_stock', 'listed', 'rented', 'sold', 'reserved', 'disposed']) {
      map[s] = counts.find((c) => c.status === s)?._count.id ?? 0;
    }
    return map;
  },

  async getRecent(limit = 10) {
    const items = await prisma.item.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: itemInclude,
    });
    return withDisplaySubCategoryList(items);
  },

  async getRecentlyAcquired(limit = 10) {
    const items = await prisma.item.findMany({
      take: limit,
      orderBy: { acquisitionDate: 'desc' },
      include: itemInclude,
    });
    return withDisplaySubCategoryList(items);
  },

  async getAvailable(params: { search?: string; sub_category_id?: string; location?: string }) {
    const where: Prisma.ItemWhereInput = {
      status: { in: ['in_stock', 'listed', 'reserved'] as ItemStatus[] },
    };
    if (params.sub_category_id) where.subCategoryId = params.sub_category_id;
    if (params.location?.trim()) {
      const loc = params.location.trim();
      where.OR = [
        { prefecture: { contains: loc, mode: 'insensitive' } },
        { city: { contains: loc, mode: 'insensitive' } },
        { locationArea: { contains: loc, mode: 'insensitive' } },
      ];
    }
    if (params.search?.trim()) {
      where.OR = [
        { title: { contains: params.search.trim(), mode: 'insensitive' } },
        { notes: { contains: params.search.trim(), mode: 'insensitive' } },
      ];
    }
    const items = await prisma.item.findMany({
      where,
      orderBy: { title: 'asc' },
      include: itemInclude,
    });
    return withDisplaySubCategoryList(items);
  },

  async getMany(params: { status?: string; sub_category_id?: string; search?: string }) {
    const where: Prisma.ItemWhereInput = {};
    if (params.status) where.status = params.status as ItemStatus;
    if (params.sub_category_id) where.subCategoryId = params.sub_category_id;
    if (params.search?.trim()) {
      where.OR = [
        { title: { contains: params.search.trim(), mode: 'insensitive' } },
        { notes: { contains: params.search.trim(), mode: 'insensitive' } },
      ];
    }
    const items = await prisma.item.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: itemInclude,
    });
    return withDisplaySubCategoryList(items);
  },

  async getById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        ...itemInclude,
        rentals: { orderBy: { createdAt: 'desc' }, include: { customer: true } },
        sale: { include: { customer: true } },
      },
    });
    if (!item) throw notFound('Item not found');
    return withDisplaySubCategory(item);
  },

  async create(body: CreateItemBody) {
    const sub = await prisma.subCategory.findUnique({ where: { id: body.sub_category_id } });
    if (!sub) throw validationError('Invalid sub_category_id');

    const isOther = sub.name.toLowerCase() === 'other';
    const customVal = body.custom_sub_category?.trim();
    if (isOther) {
      if (!customVal || customVal.length < 2) throw validationError('Custom sub category is required when sub category is "other" (min 2 characters)');
    }

    const hasContactId = body.acquisition_contact_id != null && String(body.acquisition_contact_id).trim() !== '';
    if (!hasContactId && !body.contact) {
      throw validationError('Either acquisition_contact_id or contact (source_platform, name) is required for acquisition');
    }
    let acquisitionContactId: string | undefined;
    if (hasContactId) {
      const contact = await prisma.contact.findUnique({ where: { id: body.acquisition_contact_id! } });
      if (!contact) throw validationError('Invalid acquisition_contact_id');
      acquisitionContactId = body.acquisition_contact_id!;
    } else if (body.contact) {
      const contact = await contactService.create(body.contact);
      acquisitionContactId = contact.id;
    }

    const acquisitionDate = body.acquisition_date ? new Date(body.acquisition_date) : undefined;
    const item = await prisma.item.create({
      data: {
        title: body.title,
        subCategoryId: body.sub_category_id,
        customSubCategory: isOther ? customVal! : null,
        acquisitionContactId: acquisitionContactId ?? undefined,
        sourcePlatform: body.source_platform ?? undefined,
        acquisitionType: body.acquisition_type,
        acquisitionCost: body.acquisition_cost,
        originalPrice: body.original_price ?? undefined,
        condition: body.condition,
        prefecture: body.prefecture ?? 'Undecided',
        city: body.city ?? 'Undecided',
        exactLocation: body.exact_location ?? undefined,
        locationVisibility: body.location_visibility ?? 'hidden',
        locationArea: body.location_area ?? undefined,
        status: body.status,
        acquisitionDate: acquisitionDate ?? undefined,
        notes: body.notes ?? undefined,
      },
      include: itemInclude,
    });
    return withDisplaySubCategory(item);
  },

  async update(id: string, body: UpdateItemBody) {
    const existing = await prisma.item.findUnique({
      where: { id },
      include: itemInclude,
    });
    if (!existing) throw notFound('Item not found');
    if (body.acquisition_contact_id !== undefined && body.acquisition_contact_id != null && body.acquisition_contact_id !== '') {
      const contact = await prisma.contact.findUnique({ where: { id: body.acquisition_contact_id } });
      if (!contact) throw validationError('Invalid acquisition_contact_id');
    }

    const subId = body.sub_category_id !== undefined ? body.sub_category_id : existing.subCategoryId;
    const sub = await prisma.subCategory.findUnique({ where: { id: subId } });
    if (!sub) throw validationError('Invalid sub_category_id');
    const isOther = sub.name.toLowerCase() === 'other';
    const customVal = body.custom_sub_category !== undefined ? body.custom_sub_category?.trim() : existing.customSubCategory;
    if (isOther) {
      if (!customVal || customVal.length < 2) throw validationError('Custom sub category is required when sub category is "other" (min 2 characters)');
    }

    const acquisitionDate = body.acquisition_date !== undefined
      ? (body.acquisition_date ? new Date(body.acquisition_date) : null)
      : undefined;
    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.sub_category_id !== undefined && { subCategoryId: body.sub_category_id }),
        customSubCategory: body.sub_category_id !== undefined || body.custom_sub_category !== undefined
          ? (isOther ? customVal! : null)
          : undefined,
        ...(body.acquisition_contact_id !== undefined && { acquisitionContactId: body.acquisition_contact_id || null }),
        ...(body.source_platform !== undefined && { sourcePlatform: body.source_platform }),
        ...(body.acquisition_type !== undefined && { acquisitionType: body.acquisition_type }),
        ...(body.acquisition_cost !== undefined && { acquisitionCost: body.acquisition_cost }),
        ...(body.original_price !== undefined && { originalPrice: body.original_price }),
        ...(body.condition !== undefined && { condition: body.condition }),
        ...(body.prefecture !== undefined && { prefecture: body.prefecture }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.exact_location !== undefined && { exactLocation: body.exact_location }),
        ...(body.location_visibility !== undefined && { locationVisibility: body.location_visibility }),
        ...(body.location_area !== undefined && { locationArea: body.location_area }),
        ...(body.status !== undefined && { status: body.status }),
        ...(acquisitionDate !== undefined && { acquisitionDate }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: itemInclude,
    });
    return withDisplaySubCategory(item);
  },

  async setListed(id: string) {
    const item = await this.getById(id);
    const allowed = ['in_stock', 'reserved'].includes(item.status);
    if (!allowed) throw conflict(`Cannot list item with status ${item.status}`);
    const updated = await prisma.item.update({
      where: { id },
      data: { status: 'listed' },
      include: itemInclude,
    });
    return withDisplaySubCategory(updated);
  },

  async setReserved(id: string, customerId: string, notes?: string | null) {
    const item = await this.getById(id);
    const allowed = ['in_stock', 'listed'].includes(item.status);
    if (!allowed) throw conflict(`Cannot reserve item with status ${item.status}`);
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw validationError('Invalid customer_id');
    const updated = await prisma.item.update({
      where: { id },
      data: { status: 'reserved', notes: notes ?? item.notes },
      include: itemInclude,
    });
    return withDisplaySubCategory(updated);
  },

  async dispose(id: string) {
    await this.getById(id);
    const updated = await prisma.item.update({
      where: { id },
      data: { status: 'disposed' },
      include: itemInclude,
    });
    return withDisplaySubCategory(updated);
  },
};
