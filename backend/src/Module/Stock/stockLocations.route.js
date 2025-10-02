const express = require('express');
const router = express.Router();
<<<<<<<< HEAD:backend/src/Module/Stock/routes/stockLocations.route.js
const { authenticate } = require('../../Auth/authMiddleware');
const stockLocationsController = require('../controllers/stockLocations.controller');
========
const { authenticate } = require('../Auth/authMiddleware');
const stockLocationsController = require('./stockLocations.controller');
>>>>>>>> 662c9195f1552aabe09dd68a6ae35cbb357ea64d:backend/src/Module/Stock/stockLocations.route.js

router.post('/', authenticate, stockLocationsController.createStockLocation);

router.get('/', authenticate, stockLocationsController.getAllStockLocations);

router.get('/:id', authenticate, stockLocationsController.getStockLocationById);

router.put('/:id', authenticate, stockLocationsController.updateStockLocation);

router.delete('/:id', authenticate, stockLocationsController.deleteStockLocation);

router.get('/location/:locationId/products', authenticate, stockLocationsController.getProductsByLocation);

router.get('/batches/product/:productId/location/:locationId', authenticate, stockLocationsController.findBatchesByProductAndLocation);

router.get('/batches/product/:productId', authenticate, stockLocationsController.findAllBatchesByProduct);

module.exports = router;