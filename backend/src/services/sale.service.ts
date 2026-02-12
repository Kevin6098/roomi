import { prisma } from '../db.js';
import { conflict, notFound, validationError } from '../utils/errors.js';
import type { CreateSaleBody, UpdateSaleBody } from '../validators/sales.js';
import { customerService } from './customer.service.js';
import { reservationService } from './reservation.service.js';

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
    const item = await prisma.item.findUnique({
      where: { id: body.item_id },
      include: {
        sale: true,
        rentals: { where: { status: 'active' } },
        reservations: { where: { status: 'active' }, take: 1, include: { contact: true } },
        itemListings: { where: { status: { in: ['active', 'needs_update'] } } },
      },
    });
    if (!item) throw notFound('Item not found');
    if (item.status === 'sold' || item.sale) throw conflict('Item is already sold');
    if (item.status === 'rented' || item.rentals.length > 0) throw conflict('Item is currently rented');
    const hasListing = item.itemListings && item.itemListings.length > 0;
    if (!hasListing) throw validationError('Item must be listed (posted on at least one platform) before you can record a sale.');

    let customerId: string;
    const activeReservation = item.reservations[0];
    if (item.status === 'reserved' && activeReservation) {
      if (activeReservation.contactId) {
        const customer = await customerService.getOrCreateCustomerFromContact(activeReservation.contactId, undefined);
        customerId = customer.id;
      } else {
        const cid = body.customer_id
          ? (await prisma.customer.findUnique({ where: { id: body.customer_id } }))?.id
          : (await customerService.getOrCreateCustomerFromContact(body.contact_id ?? undefined, body.contact)).id;
        if (!cid) throw notFound('Customer not found');
        customerId = cid;
      }
    } else {
      customerId = body.customer_id
        ? (await prisma.customer.findUnique({ where: { id: body.customer_id } }))?.id!
        : (await customerService.getOrCreateCustomerFromContact(body.contact_id ?? undefined, body.contact)).id;
      if (!customerId) throw notFound('Customer not found');
    }

    return prisma.$transaction(async (tx) => {
      // When an item is sold, mark all its listings as closed (unlisted) so you know to remove the post on each platform.
      await tx.itemListing.updateMany({
        where: { itemId: body.item_id, status: { in: ['active', 'needs_update'] } },
        data: { status: 'closed' },
      });
      const sale = await tx.sale.create({
        data: {
          itemId: body.item_id,
          customerId,
          salePrice: body.sale_price,
          saleDate: new Date(body.sale_date),
          platformSold: body.platform_sold ?? undefined,
          handoverLocation: body.handover_location ?? undefined,
          handoverPrefecture: body.handover_prefecture ?? undefined,
          handoverCity: body.handover_city ?? undefined,
          handoverExactLocation: body.handover_exact_location ?? undefined,
          notes: body.notes ?? undefined,
        },
        include: { item: true, customer: true },
      });
      await tx.item.update({
        where: { id: body.item_id },
        data: { status: 'sold', isListed: false },
      });
      if (activeReservation) {
        await tx.reservation.update({
          where: { id: activeReservation.id },
          data: { status: 'converted' },
        });
      }
      return sale;
    });
  },

  async update(id: string, body: UpdateSaleBody) {
    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) throw notFound('Sale not found');
    const data: Record<string, unknown> = {};
    if (body.sale_price !== undefined) data.salePrice = body.sale_price;
    if (body.sale_date !== undefined) data.saleDate = new Date(body.sale_date);
    if (body.platform_sold !== undefined) data.platformSold = body.platform_sold;
    if (body.handover_location !== undefined) data.handoverLocation = body.handover_location;
    if (body.handover_prefecture !== undefined) data.handoverPrefecture = body.handover_prefecture;
    if (body.handover_city !== undefined) data.handoverCity = body.handover_city;
    if (body.handover_exact_location !== undefined) data.handoverExactLocation = body.handover_exact_location;
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
