import { prisma } from '../db.js';
import { conflict, notFound } from '../utils/errors.js';
import type { CreateSaleBody, UpdateSaleBody } from '../validators/sales.js';

export const saleService = {
  async getMany() {
    return prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
      include: { item: { include: { subCategory: { include: { mainCategory: true } } } }, customer: true },
    });
  },

  async getById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { item: true, customer: true },
    });
    if (!sale) throw notFound('Sale not found');
    return sale;
  },

  async create(body: CreateSaleBody) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id: body.item_id },
        include: { sale: true, rentals: { where: { status: 'active' } } },
      });
      if (!item) throw notFound('Item not found');
      if (item.status === 'sold' || item.sale) throw conflict('Item is already sold');
      if (item.status === 'rented' || item.rentals.length > 0) throw conflict('Item is currently rented');
      const customer = await tx.customer.findUnique({ where: { id: body.customer_id } });
      if (!customer) throw notFound('Customer not found');

      const sale = await tx.sale.create({
        data: {
          itemId: body.item_id,
          customerId: body.customer_id,
          salePrice: body.sale_price ?? undefined,
          saleDate: new Date(body.sale_date),
          platformSold: body.platform_sold ?? undefined,
          handoverLocation: body.handover_location ?? undefined,
          notes: body.notes ?? undefined,
        },
        include: { item: true, customer: true },
      });
      await tx.item.update({
        where: { id: body.item_id },
        data: { status: 'sold' },
      });
      return sale;
    });
  },

  async update(id: string, body: UpdateSaleBody) {
    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) throw notFound('Sale not found');
    const data: { salePrice?: number | null; saleDate?: Date; platformSold?: string | null; handoverLocation?: string | null; notes?: string | null } = {};
    if (body.sale_price !== undefined) data.salePrice = body.sale_price;
    if (body.sale_date !== undefined) data.saleDate = new Date(body.sale_date);
    if (body.platform_sold !== undefined) data.platformSold = body.platform_sold;
    if (body.handover_location !== undefined) data.handoverLocation = body.handover_location;
    if (body.notes !== undefined) data.notes = body.notes;
    return prisma.sale.update({
      where: { id },
      data,
      include: { item: true, customer: true },
    });
  },

  async delete(id: string) {
    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) throw notFound('Sale not found');
    await prisma.$transaction([
      prisma.item.update({ where: { id: sale.itemId }, data: { status: 'in_stock' } }),
      prisma.sale.delete({ where: { id } }),
    ]);
  },
};
