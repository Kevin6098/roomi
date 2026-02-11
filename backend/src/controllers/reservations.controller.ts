import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service.js';
import { reserveItemSchema, depositReceivedSchema, cancelReservationSchema } from '../validators/reservations.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getByItemId(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await reservationService.getByItemId(req.params.id);
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await reservationService.getById(req.params.id);
    res.json(r);
  } catch (e) {
    next(e);
  }
}

export const reserve = [
  validateBody(reserveItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservation = await reservationService.reserve(req.params.id, req.body);
      res.status(201).json(reservation);
    } catch (e) {
      next(e);
    }
  },
];

export const setDepositReceived = [
  validateBody(depositReceivedSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = await reservationService.setDepositReceived(req.params.id, req.body);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },
];

export const cancel = [
  validateBody(cancelReservationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = await reservationService.cancel(req.params.id);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },
];
