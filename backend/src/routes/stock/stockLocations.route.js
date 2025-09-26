const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const stockLocationsController = require('../../controllers/stock/stockLocations.controller');

router.post('/', authenticate, stockLocationsController.createStockLocation);

router.get('/', authenticate, stockLocationsController.getAllStockLocations);

router.get('/:id', authenticate, stockLocationsController.getStockLocationById);

router.put('/:id', authenticate, stockLocationsController.updateStockLocation);

router.delete('/:id', authenticate, stockLocationsController.deleteStockLocation);

module.exports = router;