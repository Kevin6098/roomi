import { Router } from 'express';
import * as c from '../controllers/listings.controller.js';

const router = Router({ mergeParams: true });

router.put('/:listingId', ...c.update);

export default router;
