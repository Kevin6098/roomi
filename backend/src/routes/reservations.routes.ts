import { Router } from 'express';
import * as c from '../controllers/reservations.controller.js';

const router = Router();

router.get('/:id', c.getById);
router.put('/:id/deposit', ...c.setDepositReceived);
router.put('/:id/cancel', ...c.cancel);

export default router;
