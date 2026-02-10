import { Router } from 'express';
import * as c from '../controllers/categories.controller.js';

const router = Router();
router.get('/main', c.getMain);
router.get('/main/:id', c.getMainById);
router.get('/sub', c.getAllSubs);
router.get('/sub/by-id/:id', c.getSubById);
router.get('/sub/:mainId', c.getSubByMainId);
router.post('/main', ...c.createMain);
router.put('/main/:id', ...c.updateMain);
router.delete('/main/:id', c.deleteMain);
router.post('/sub', ...c.createSub);
router.put('/sub/:id', ...c.updateSub);
router.delete('/sub/:id', c.deleteSub);
export default router;
