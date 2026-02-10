import { Request, Response, NextFunction } from 'express';
import { saleService } from '../services/sale.service.js';
import { createSaleSchema, updateSaleSchema } from '../validators/sales.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getMany(_req: Request, res: Response, next: NextFunction) {
  try {
    const list = await saleService.getMany();
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await saleService.getById(req.params.id);
    res.json(sale);
  } catch (e) {
    next(e);
  }
}

export const create = [
  validateBody(createSaleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sale = await saleService.create(req.body);
      res.status(201).json(sale);
    } catch (e) {
      next(e);
    }
  },
];

export const update = [
  validateBody(updateSaleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sale = await saleService.update(req.params.id, req.body);
      res.json(sale);
    } catch (e) {
      next(e);
    }
  },
];

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await saleService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
