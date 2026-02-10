import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customers.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getMany(_req: Request, res: Response, next: NextFunction) {
  try {
    const list = await customerService.getMany();
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.getById(req.params.id);
    res.json(customer);
  } catch (e) {
    next(e);
  }
}

export const create = [
  validateBody(createCustomerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json(customer);
    } catch (e) {
      next(e);
    }
  },
];

export const update = [
  validateBody(updateCustomerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      res.json(customer);
    } catch (e) {
      next(e);
    }
  },
];

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await customerService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
