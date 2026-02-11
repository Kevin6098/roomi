import { prisma } from '../db.js';
import { notFound } from '../utils/errors.js';
import type { CreateContactBody, UpdateContactBody } from '../validators/contacts.js';

export const contactService = {
  async getMany(search?: string) {
    const where = search?.trim()
      ? {
          OR: [
            { name: { contains: search.trim(), mode: 'insensitive' as const } },
            { sourcePlatform: { contains: search.trim(), mode: 'insensitive' as const } },
            { platformUserId: { contains: search.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {};
    return prisma.contact.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { acquisitionItems: true },
    });
    if (!contact) throw notFound('Contact not found');
    return contact;
  },

  async create(body: CreateContactBody) {
    return prisma.contact.create({
      data: {
        sourcePlatform: body.source_platform,
        name: body.name,
        platformUserId: body.platform_user_id ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
        notes: body.notes ?? undefined,
      },
    });
  },

  async update(id: string, body: UpdateContactBody) {
    await this.getById(id);
    return prisma.contact.update({
      where: { id },
      data: {
        ...(body.source_platform !== undefined && { sourcePlatform: body.source_platform }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.platform_user_id !== undefined && { platformUserId: body.platform_user_id }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
  },

  async delete(id: string) {
    await this.getById(id);
    return prisma.contact.delete({ where: { id } });
  },
};
