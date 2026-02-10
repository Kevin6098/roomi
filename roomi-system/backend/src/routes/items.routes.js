// File: backend/src/routes/items.routes.js

const express = require('express');
const controller = require('../controllers/items.controller');

const router = express.Router();
router.get('/counts', controller.getCounts);
router.get('/recent', controller.getRecent);
router.get('/recently-acquired', controller.getRecentlyAcquired);
router.get('/available', controller.getAvailable);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
