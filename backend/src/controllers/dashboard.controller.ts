import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

export async function getOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getOverview();
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getFinance(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getFinance();
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(parseInt(String(req.query.limit), 10) || 50, 100);
    const list = await dashboardService.getActivity(limit);
    res.json(list);
  } catch (e) {
    next(e);
  }
}
