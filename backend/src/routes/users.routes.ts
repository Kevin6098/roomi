import { Router } from 'express';
import * as c from '../controllers/users.controller.js';
import { requireAuth, requireOwner } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth, requireOwner);
router.get('/', c.getMany);
router.get('/:id', c.getById);
router.post('/', ...c.create);
router.put('/:id', ...c.update);
router.delete('/:id', c.remove);
export default router;
