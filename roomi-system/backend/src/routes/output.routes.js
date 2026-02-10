// File: backend/src/routes/output.routes.js

const express = require('express');
const controller = require('../controllers/output.controller');

const router = express.Router();
router.post('/sell', controller.sell);
router.post('/rent', controller.rent);
router.put('/rentals/:id/end', controller.endRental);

module.exports = router;
