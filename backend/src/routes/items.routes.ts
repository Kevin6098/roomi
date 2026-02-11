import { Router } from 'express';
import * as c from '../controllers/items.controller.js';

const router = Router();
router.get('/counts', c.getCounts);
router.get('/recent', c.getRecent);
router.get('/recently-acquired', c.getRecentlyAcquired);
router.get('/available', c.getAvailable);
router.get('/', c.getMany);
router.get('/:id', c.getById);
router.post('/', ...c.create);
router.put('/:id', ...c.update);
router.post('/:id/list', c.setListed);
router.post('/:id/reserve', ...c.setReserved);
router.delete('/:id', c.dispose);
export default router;
