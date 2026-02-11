import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contact.service.js';
import { createContactSchema, updateContactSchema } from '../validators/contacts.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getMany(req: Request, res: Response, next: NextFunction) {
  try {
    const search = (req.query.search as string) ?? undefined;
    const list = await contactService.getMany(search);
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const contact = await contactService.getById(req.params.id);
    res.json(contact);
  } catch (e) {
    next(e);
  }
}

export const create = [
  validateBody(createContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await contactService.create(req.body);
      res.status(201).json(contact);
    } catch (e) {
      next(e);
    }
  },
];

export const update = [
  validateBody(updateContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await contactService.update(req.params.id, req.body);
      res.json(contact);
    } catch (e) {
      next(e);
    }
  },
];

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await contactService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
