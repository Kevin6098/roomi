import { ItemStatus, Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { conflict, notFound, validationError } from '../utils/errors.js';
import type { CreateItemBody, UpdateItemBody } from '../validators/items.js';

const itemInclude = {
  subCategory: { include: { mainCategory: true } },
} as const;

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
    return prisma.item.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: itemInclude,
    });
  },

  async getRecentlyAcquired(limit = 10) {
    return prisma.item.findMany({
      take: limit,
      orderBy: { acquisitionDate: 'desc' },
      include: itemInclude,
    });
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
    return prisma.item.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: itemInclude,
    });
  },

  async getById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        ...itemInclude,
        rentals: { orderBy: { createdAt: 'desc' } },
        sale: true,
      },
    });
    if (!item) throw notFound('Item not found');
    return item;
  },

  async create(body: CreateItemBody) {
    const sub = await prisma.subCategory.findUnique({ where: { id: body.sub_category_id } });
    if (!sub) throw validationError('Invalid sub_category_id');
    const acquisitionDate = body.acquisition_date ? new Date(body.acquisition_date) : undefined;
    return prisma.item.create({
      data: {
        title: body.title,
        subCategoryId: body.sub_category_id,
        sourcePlatform: body.source_platform ?? undefined,
        acquisitionType: body.acquisition_type,
        acquisitionCost: body.acquisition_cost,
        originalPrice: body.original_price ?? undefined,
        condition: body.condition,
        locationArea: body.location_area ?? undefined,
        exactLocation: body.exact_location ?? undefined,
        status: body.status,
        acquisitionDate: acquisitionDate ?? undefined,
        notes: body.notes ?? undefined,
      },
      include: itemInclude,
    });
  },

  async update(id: string, body: UpdateItemBody) {
    await this.getById(id);
    const acquisitionDate = body.acquisition_date !== undefined
      ? (body.acquisition_date ? new Date(body.acquisition_date) : null)
      : undefined;
    return prisma.item.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.sub_category_id !== undefined && { subCategoryId: body.sub_category_id }),
        ...(body.source_platform !== undefined && { sourcePlatform: body.source_platform }),
        ...(body.acquisition_type !== undefined && { acquisitionType: body.acquisition_type }),
        ...(body.acquisition_cost !== undefined && { acquisitionCost: body.acquisition_cost }),
        ...(body.original_price !== undefined && { originalPrice: body.original_price }),
        ...(body.condition !== undefined && { condition: body.condition }),
        ...(body.location_area !== undefined && { locationArea: body.location_area }),
        ...(body.exact_location !== undefined && { exactLocation: body.exact_location }),
        ...(body.status !== undefined && { status: body.status }),
        ...(acquisitionDate !== undefined && { acquisitionDate }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: itemInclude,
    });
  },

  async setListed(id: string) {
    const item = await this.getById(id);
    const allowed = ['in_stock', 'reserved'].includes(item.status);
    if (!allowed) throw conflict(`Cannot list item with status ${item.status}`);
    return prisma.item.update({
      where: { id },
      data: { status: 'listed' },
      include: itemInclude,
    });
  },

  async setReserved(id: string, customerId: string, notes?: string | null) {
    const item = await this.getById(id);
    const allowed = ['in_stock', 'listed'].includes(item.status);
    if (!allowed) throw conflict(`Cannot reserve item with status ${item.status}`);
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw validationError('Invalid customer_id');
    return prisma.item.update({
      where: { id },
      data: { status: 'reserved', notes: notes ?? item.notes },
      include: itemInclude,
    });
  },

  async dispose(id: string) {
    await this.getById(id);
    return prisma.item.update({
      where: { id },
      data: { status: 'disposed' },
      include: itemInclude,
    });
  },
};
