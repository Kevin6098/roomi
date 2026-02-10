// File: backend/src/routes/categories.routes.js

const express = require('express');
const controller = require('../controllers/categories.controller');

const router = express.Router();
router.get('/main', controller.getMain);
router.get('/sub/:mainId', controller.getSubByMainId);
router.post('/main', controller.createMain);
router.post('/sub', controller.createSub);

module.exports = router;
