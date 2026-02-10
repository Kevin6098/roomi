import { Request, Response, NextFunction } from 'express';
import { itemService } from '../services/item.service.js';
import { createItemSchema, updateItemSchema, reserveItemSchema } from '../validators/items.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getCounts(_req: Request, res: Response, next: NextFunction) {
  try {
    const counts = await itemService.getCounts();
    res.json(counts);
  } catch (e) {
    next(e);
  }
}

export async function getRecent(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await itemService.getRecent(10);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function getRecentlyAcquired(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await itemService.getRecentlyAcquired(10);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function getMany(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, sub_category_id, search } = req.query as Record<string, string | undefined>;
    const items = await itemService.getMany({ status, sub_category_id, search });
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await itemService.getById(req.params.id);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

export const create = [
  validateBody(createItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await itemService.create(req.body);
      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  },
];

export const update = [
  validateBody(updateItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await itemService.update(req.params.id, req.body);
      res.json(item);
    } catch (e) {
      next(e);
    }
  },
];

export async function setListed(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await itemService.setListed(req.params.id);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

export const setReserved = [
  validateBody(reserveItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await itemService.setReserved(req.params.id, req.body.customer_id, req.body.notes);
      res.json(item);
    } catch (e) {
      next(e);
    }
  },
];

export async function dispose(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await itemService.dispose(req.params.id);
    res.json(item);
  } catch (e) {
    next(e);
  }
}
