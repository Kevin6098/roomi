// File: backend/src/routes/sales.routes.js

const express = require('express');
const controller = require('../controllers/sales.controller');

const router = express.Router();
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);

module.exports = router;
