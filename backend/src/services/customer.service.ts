import { prisma } from '../db.js';
import { notFound } from '../utils/errors.js';
import type { CreateCustomerBody, UpdateCustomerBody } from '../validators/customers.js';

export const customerService = {
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
      },
    });
  },

  async delete(id: string) {
    await this.getById(id);
    return prisma.customer.delete({ where: { id } });
  },
};
