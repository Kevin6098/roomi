import { Router } from 'express';
import * as c from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/overview', c.getOverview);
router.get('/finance', c.getFinance);
router.get('/activity', c.getActivity);
export default router;
