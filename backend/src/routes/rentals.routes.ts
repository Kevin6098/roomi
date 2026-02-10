import { Router } from 'express';
import * as c from '../controllers/rentals.controller.js';

const router = Router();
router.get('/', c.getMany);
router.get('/:id', c.getById);
router.post('/start', ...c.start);
router.put('/:id/end', ...c.end);
router.patch('/:id/damage', ...c.setDamage);
export default router;
