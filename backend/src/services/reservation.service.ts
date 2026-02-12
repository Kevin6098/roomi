import { prisma } from '../db.js';
import { conflict, notFound, validationError } from '../utils/errors.js';
import type { ReserveItemBody, DepositReceivedBody } from '../validators/reservations.js';
import { contactService } from './contact.service.js';
import { customerService } from './customer.service.js';

export const reservationService = {
  async getByItemId(itemId: string) {
    return prisma.reservation.findMany({
      where: { itemId },
      orderBy: { reservedAt: 'desc' },
      include: { contact: true },
    });
  },

  async getActiveByItemId(itemId: string) {
    return prisma.reservation.findFirst({
      where: { itemId, status: 'active' },
      include: { contact: true },
    });
  },

  async getById(id: string) {
    const r = await prisma.reservation.findUnique({
      where: { id },
      include: { item: true, contact: true },
    });
    if (!r) throw notFound('Reservation not found');
    return r;
  },

  /** Create reservation: item -> reserved, listings -> needs_update. */
  async reserve(itemId: string, body: ReserveItemBody) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { reservations: { where: { status: 'active' } }, itemListings: true },
    });
    if (!item) throw notFound('Item not found');
    if (item.status === 'sold') throw conflict('Item is sold');
    if (item.status === 'rented') throw conflict('Item is rented');
    if (item.reservations.length > 0) throw conflict('Item is already reserved');

    const allowedStatuses = ['in_stock', 'overdue'];
    if (!allowedStatuses.includes(item.status)) throw conflict(`Cannot reserve item with status ${item.status}`);

    let contactId: string | null = null;
    if (body.contact_id) {
      const c = await prisma.contact.findUnique({ where: { id: body.contact_id } });
      if (!c) throw validationError('Invalid contact_id');
      contactId = c.id;
    } else if (body.contact) {
      const contact = await contactService.create({
        source_platform: body.contact.source_platform,
        name: body.contact.name,
        platform_user_id: body.contact.platform_user_id ?? undefined,
        phone: body.contact.phone ?? undefined,
        email: body.contact.email ?? undefined,
        notes: body.contact.notes ?? undefined,
      });
      contactId = contact.id;
    }

    // Ensure a Customer record exists for this contact so they appear on the Customers page
    if (contactId) {
      await customerService.getOrCreateCustomerFromContact(contactId, undefined);
    }

    const expiresAt = body.expires_at ? new Date(body.expires_at) : undefined;

    return prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          itemId,
          contactId,
          reserveType: body.reserve_type,
          depositExpected: body.deposit_expected ?? undefined,
          expiresAt,
          note: body.note ?? undefined,
          status: 'active',
        },
        include: { contact: true, item: true },
      });
      await tx.item.update({
        where: { id: itemId },
        data: { status: 'reserved' },
      });
      await tx.itemListing.updateMany({
        where: { itemId, status: 'active' },
        data: { status: 'needs_update' },
      });
      return reservation;
    });
  },

  async setDepositReceived(id: string, body: DepositReceivedBody) {
    const r = await prisma.reservation.findUnique({ where: { id } });
    if (!r) throw notFound('Reservation not found');
    if (r.status !== 'active') throw conflict('Reservation is not active');

    const depositReceivedAt = body.deposit_received_at ? new Date(body.deposit_received_at) : new Date();
    return prisma.reservation.update({
      where: { id },
      data: { depositReceived: true, depositReceivedAt },
      include: { item: true, contact: true },
    });
  },

  /** Cancel reservation: item back to in_stock. */
  async cancel(id: string) {
    const r = await prisma.reservation.findUnique({ where: { id } });
    if (!r) throw notFound('Reservation not found');
    if (r.status !== 'active') throw conflict('Reservation is not active');

    const now = new Date();
    return prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: { status: 'cancelled', cancelledAt: now },
      });
      await tx.item.update({
        where: { id: r.itemId },
        data: { status: 'in_stock' },
      });
      return prisma.reservation.findUnique({
        where: { id },
        include: { item: true, contact: true },
      });
    });
  },

  /** Mark reservation as converted (after sale/rental created). */
  async markConverted(id: string) {
    const r = await prisma.reservation.findUnique({ where: { id } });
    if (!r) throw notFound('Reservation not found');
    return prisma.reservation.update({
      where: { id },
      data: { status: 'converted', convertedAt: new Date() },
      include: { item: true, contact: true },
    });
  },
};
