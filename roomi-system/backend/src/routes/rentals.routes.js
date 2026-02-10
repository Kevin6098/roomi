// File: backend/src/routes/rentals.routes.js

const express = require('express');
const controller = require('../controllers/rentals.controller');

const router = express.Router();
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/damage', controller.setDamage);

module.exports = router;
