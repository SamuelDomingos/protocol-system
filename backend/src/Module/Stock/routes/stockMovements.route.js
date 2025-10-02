const express = require('express');
const router = express.Router();
const {authenticate} = require('../../Auth/authMiddleware');
const stockMovementsController = require('../controllers/stockMovements.controller');

router.post('/', authenticate, stockMovementsController.createStockMovement);

router.get('/types', authenticate, stockMovementsController.getStockMovementTypes);

router.get('/', authenticate, stockMovementsController.getAllStockMovements);

router.get('/product/:productId', authenticate, stockMovementsController.getByProduct);

router.get('/:id', authenticate, stockMovementsController.getStockMovementById);

router.put('/:id', authenticate, stockMovementsController.updateStockMovement);

router.delete('/:id', authenticate, stockMovementsController.deleteStockMovement);

module.exports = router;