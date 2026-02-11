import { prisma } from '../db.js';
import { conflict, notFound } from '../utils/errors.js';
import type { EndRentalBody, StartRentalBody } from '../validators/rentals.js';
import { customerService } from './customer.service.js';

const today = () => new Date(new Date().toISOString().slice(0, 10));

function isOverdue(expectedEndDate: Date, status: string): boolean {
  return status === 'active' && new Date(expectedEndDate) < today();
}

function addIsOverdue<T extends { expectedEndDate: Date; status: string }>(r: T) {
  return { ...r, isOverdue: isOverdue(r.expectedEndDate, r.status) };
}

export const rentalService = {
  async getMany(params: { status?: string; overdue?: string }) {
    const where: { status?: 'active' | 'ended' } = {};
    if (params.status === 'active' || params.status === 'ended') where.status = params.status;
    let rentals = await prisma.rental.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { item: { include: { subCategory: { include: { mainCategory: true } } } }, customer: true },
    });
    if (params.overdue === 'true') {
      rentals = rentals.filter((r) => r.status === 'active' && new Date(r.expectedEndDate) < today());
    }
    return rentals.map(addIsOverdue);
  },

  async getById(id: string) {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { item: { include: { subCategory: { include: { mainCategory: true } } } }, customer: true },
    });
    if (!rental) throw notFound('Rental not found');
    return addIsOverdue(rental);
  },

  async start(body: StartRentalBody) {
    const customerId = body.customer_id
      ? (await prisma.customer.findUnique({ where: { id: body.customer_id } }))?.id
      : (await customerService.getOrCreateCustomerFromContact(body.contact_id ?? undefined, body.contact)).id;
    if (!customerId) throw notFound('Customer not found');

    const rentPeriod = body.rent_period === 'annually' ? 'annually' : 'monthly';
    const rentPriceMonthly = body.rent_period === 'annually' && body.rent_price_annually != null
      ? body.rent_price_annually / 12
      : (body.rent_price_monthly ?? undefined);
    const rentPriceAnnually = body.rent_period === 'annually' ? (body.rent_price_annually ?? undefined) : undefined;

    return prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: body.item_id }, include: { rentals: { where: { status: 'active' } } } });
      if (!item) throw notFound('Item not found');
      if (item.status === 'sold') throw conflict('Item is sold');
      if (item.rentals.length > 0) throw conflict('Item already has an active rental');

      const rental = await tx.rental.create({
        data: {
          itemId: body.item_id,
          customerId,
          rentPeriod,
          rentPriceMonthly: rentPriceMonthly ?? undefined,
          rentPriceAnnually: rentPriceAnnually ?? undefined,
          deposit: body.deposit ?? undefined,
          startDate: new Date(body.start_date),
          expectedEndDate: new Date(body.expected_end_date),
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
        data: { status: 'rented' },
      });
      return addIsOverdue(rental);
    });
  },

  async end(id: string, body: EndRentalBody) {
    return prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({ where: { id } });
      if (!rental) throw notFound('Rental not found');
      if (rental.status === 'ended') throw conflict('Rental already ended');

      await tx.rental.update({
        where: { id },
        data: {
          status: 'ended',
          actualEndDate: body.actual_end_date ? new Date(body.actual_end_date) : new Date(),
          damageFee: body.damage_fee ?? undefined,
          notes: body.notes ?? rental.notes ?? undefined,
        },
      });
      await tx.item.update({
        where: { id: rental.itemId },
        data: { status: body.next_item_status },
      });
      const updated = await tx.rental.findUnique({
        where: { id },
        include: { item: true, customer: true },
      });
      return addIsOverdue(updated!);
    });
  },

  async setDamage(id: string, damageFee: number) {
    const rental = await prisma.rental.findUnique({ where: { id } });
    if (!rental) throw notFound('Rental not found');
    return prisma.rental.update({
      where: { id },
      data: { damageFee },
      include: { item: true, customer: true },
    });
  },
};
