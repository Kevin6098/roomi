import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { createUserSchema, updateUserSchema } from '../validators/users.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getMany(_req: Request, res: Response, next: NextFunction) {
  try {
    const list = await userService.getMany();
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getById(req.params.id);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export const create = [
  validateBody(createUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  },
];

export const update = [
  validateBody(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json(user);
    } catch (e) {
      next(e);
    }
  },
];

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
