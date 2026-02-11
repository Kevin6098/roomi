import { Request, Response, NextFunction } from 'express';
import { listingService } from '../services/listing.service.js';
import { createListingSchema, updateListingSchema, setListedFlagSchema, confirmListingsUpdatedSchema } from '../validators/listings.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getByItemId(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await listingService.getByItemId(req.params.id);
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export const create = [
  validateBody(createListingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listing = await listingService.create(req.params.id, req.body);
      res.status(201).json(listing);
    } catch (e) {
      next(e);
    }
  },
];

export const update = [
  validateBody(updateListingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listing = await listingService.update(req.params.listingId, req.body);
      res.json(listing);
    } catch (e) {
      next(e);
    }
  },
];

export const setListedFlag = [
  validateBody(setListedFlagSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await listingService.setListedFlag(req.params.id, req.body.is_listed);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
];

export const confirmListingsUpdated = [
  validateBody(confirmListingsUpdatedSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await listingService.confirmListingsUpdated(req.params.id, req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
];
