import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';
import {
  createMainCategorySchema,
  updateMainCategorySchema,
  createSubCategorySchema,
  updateSubCategorySchema,
} from '../validators/categories.js';
import { validateBody } from '../middlewares/validate.middleware.js';

export async function getMain(_req: Request, res: Response, next: NextFunction) {
  try {
    const list = await categoryService.getMain();
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getMainById(req: Request, res: Response, next: NextFunction) {
  try {
    const main = await categoryService.getMainById(req.params.id);
    res.json(main);
  } catch (e) {
    next(e);
  }
}

export async function getSubByMainId(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await categoryService.getSubByMainId(req.params.mainId);
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getSubById(req: Request, res: Response, next: NextFunction) {
  try {
    const sub = await categoryService.getSubById(req.params.id);
    res.json(sub);
  } catch (e) {
    next(e);
  }
}

export async function getAllSubs(_req: Request, res: Response, next: NextFunction) {
  try {
    const list = await categoryService.getAllSubs();
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export const createMain = [
  validateBody(createMainCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await categoryService.createMain(req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  },
];

export const updateMain = [
  validateBody(updateMainCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await categoryService.updateMain(req.params.id, req.body);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },
];

export async function deleteMain(req: Request, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteMain(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export const createSub = [
  validateBody(createSubCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await categoryService.createSub(req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  },
];

export const updateSub = [
  validateBody(updateSubCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await categoryService.updateSub(req.params.id, req.body);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },
];

export async function deleteSub(req: Request, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteSub(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
