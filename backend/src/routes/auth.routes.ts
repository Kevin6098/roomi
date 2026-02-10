import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { loginSchema } from '../validators/auth.js';

const router = Router();

router.post('/login', validateBody(loginSchema), c.login);
router.get('/me', requireAuth, c.me);

export default router;
