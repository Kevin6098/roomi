import { prisma } from '../db.js';
import { conflict, notFound, validationError } from '../utils/errors.js';
import type { CreateListingBody, UpdateListingBody, ConfirmListingsUpdatedBody } from '../validators/listings.js';

export const listingService = {
  async getByItemId(itemId: string) {
    await prisma.item.findUniqueOrThrow({ where: { id: itemId } });
    return prisma.itemListing.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(itemId: string, body: CreateListingBody) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { itemListings: { where: { status: 'active' } } },
    });
    if (!item) throw notFound('Item not found');
    if (item.status !== 'in_stock' && item.status !== 'reserved' && item.status !== 'overdue') throw conflict('Item cannot have listings in current status');

    const listing = await prisma.itemListing.create({
      data: {
        itemId,
        platform: body.platform,
        listingUrl: body.listing_url ?? undefined,
        listingRefId: body.listing_ref_id ?? undefined,
        status: 'active',
      },
    });
    await prisma.item.update({
      where: { id: itemId },
      data: { isListed: true },
    });
    return listing;
  },

  async update(listingId: string, body: UpdateListingBody) {
    const listing = await prisma.itemListing.findUnique({ where: { id: listingId } });
    if (!listing) throw notFound('Listing not found');

    return prisma.itemListing.update({
      where: { id: listingId },
      data: {
        ...(body.platform !== undefined && { platform: body.platform }),
        ...(body.listing_url !== undefined && { listingUrl: body.listing_url }),
        ...(body.listing_ref_id !== undefined && { listingRefId: body.listing_ref_id }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
  },

  async setListedFlag(itemId: string, isListed: boolean) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { itemListings: true },
    });
    if (!item) throw notFound('Item not found');
    if (item.status !== 'in_stock' && item.status !== 'reserved' && item.status !== 'overdue') throw conflict('Cannot change listed flag in current status');

    if (isListed) {
      await prisma.item.update({
        where: { id: itemId },
        data: { isListed: true },
      });
      return { isListed: true };
    }

    await prisma.$transaction([
      prisma.item.update({ where: { id: itemId }, data: { isListed: false } }),
      prisma.itemListing.updateMany({
        where: { itemId, status: { in: ['active', 'needs_update'] } },
        data: { status: 'closed' },
      }),
    ]);
    return { isListed: false };
  },

  async confirmListingsUpdated(itemId: string, body: ConfirmListingsUpdatedBody) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { itemListings: true },
    });
    if (!item) throw notFound('Item not found');

    const ids = body.listing_ids;
    const listings = await prisma.itemListing.findMany({
      where: { id: { in: ids }, itemId },
    });
    if (listings.length !== ids.length) throw validationError('Some listing IDs are invalid or do not belong to this item');

    await prisma.itemListing.updateMany({
      where: { id: { in: ids } },
      data: { status: 'closed' },
    });
    return { updated: ids.length };
  },

  async markListingsNeedsUpdate(itemId: string) {
    await prisma.itemListing.updateMany({
      where: { itemId, status: 'active' },
      data: { status: 'needs_update' },
    });
  },
};
