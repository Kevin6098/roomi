import { Router } from 'express';
import * as c from '../controllers/contacts.controller.js';

const router = Router();
router.get('/', c.getMany);
router.get('/:id', c.getById);
router.post('/', ...c.create);
router.put('/:id', ...c.update);
router.delete('/:id', c.remove);
export default router;
