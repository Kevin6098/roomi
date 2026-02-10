import { Request, Response, NextFunction } from 'express';
import { rentalService } from '../services/rental.service.js';
import { startRentalSchema, endRentalSchema, setDamageSchema } from '../validators/rentals.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getMany(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, overdue } = req.query as Record<string, string | undefined>;
    const list = await rentalService.getMany({ status, overdue });
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const rental = await rentalService.getById(req.params.id);
    res.json(rental);
  } catch (e) {
    next(e);
  }
}

export const start = [
  validateBody(startRentalSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rental = await rentalService.start(req.body);
      res.status(201).json(rental);
    } catch (e) {
      next(e);
    }
  },
];

export const end = [
  validateBody(endRentalSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rental = await rentalService.end(req.params.id, req.body);
      res.json(rental);
    } catch (e) {
      next(e);
    }
  },
];

export const setDamage = [
  validateBody(setDamageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rental = await rentalService.setDamage(req.params.id, req.body.damage_fee);
      res.json(rental);
    } catch (e) {
      next(e);
    }
  },
];
