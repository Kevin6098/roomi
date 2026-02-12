import { prisma } from '../db.js';
import { notFound, validationError } from '../utils/errors.js';
import type { CreateCustomerBody, UpdateCustomerBody } from '../validators/customers.js';
import type { CreateContactBody } from '../validators/contacts.js';

export const customerService = {
  /** Resolve contact_id or contact payload to a Customer (find by contactId or create from contact). */
  async getOrCreateCustomerFromContact(contactId?: string | null, contactPayload?: CreateContactBody | null) {
    if (contactId) {
      const existing = await prisma.customer.findFirst({ where: { contactId } });
      if (existing) return existing;
      const contact = await prisma.contact.findUnique({ where: { id: contactId } });
      if (!contact) throw validationError('Invalid contact_id');
      return prisma.customer.create({
        data: {
          contactId: contact.id,
          name: contact.name,
          phone: contact.phone ?? undefined,
          email: contact.email ?? undefined,
          sourcePlatform: contact.sourcePlatform,
          appId: contact.platformUserId ?? undefined,
        },
      });
    }
    if (contactPayload) {
      const contact = await prisma.contact.create({
        data: {
          sourcePlatform: contactPayload.source_platform,
          name: contactPayload.name,
          platformUserId: contactPayload.platform_user_id ?? undefined,
          phone: contactPayload.phone ?? undefined,
          email: contactPayload.email ?? undefined,
          notes: contactPayload.notes ?? undefined,
        },
      });
      return prisma.customer.create({
        data: {
          contactId: contact.id,
          name: contact.name,
          phone: contact.phone ?? undefined,
          email: contact.email ?? undefined,
          sourcePlatform: contact.sourcePlatform,
          appId: contact.platformUserId ?? undefined,
        },
      });
    }
    throw validationError('Either contact_id or contact payload is required');
  },

  async getMany() {
    return prisma.customer.findMany({ orderBy: { name: 'asc' } });
  },

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { rentals: true, sales: true },
    });
    if (!customer) throw notFound('Customer not found');
    return customer;
  },

  async create(body: CreateCustomerBody) {
    return prisma.customer.create({
      data: {
        name: body.name,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
        preferredLanguage: body.preferred_language,
        sourcePlatform: body.source_platform ?? undefined,
        appId: body.app_id ?? undefined,
        prefecture: body.prefecture ?? undefined,
        city: body.city ?? undefined,
        exactLocation: body.exact_location ?? undefined,
      },
    });
  },

  async update(id: string, body: UpdateCustomerBody) {
    await this.getById(id);
    return prisma.customer.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.preferred_language !== undefined && { preferredLanguage: body.preferred_language }),
        ...(body.source_platform !== undefined && { sourcePlatform: body.source_platform }),
        ...(body.app_id !== undefined && { appId: body.app_id }),
        ...(body.prefecture !== undefined && { prefecture: body.prefecture }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.exact_location !== undefined && { exactLocation: body.exact_location }),
      },
    });
  },

  async delete(id: string) {
    await this.getById(id);
    return prisma.customer.delete({ where: { id } });
  },
};
