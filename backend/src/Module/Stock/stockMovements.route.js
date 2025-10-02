const express = require('express');
const router = express.Router();
<<<<<<<< HEAD:backend/src/Module/Stock/routes/stockMovements.route.js
const {authenticate} = require('../../Auth/authMiddleware');
const stockMovementsController = require('../controllers/stockMovements.controller');
========
const {authenticate} = require('../Auth/authMiddleware');
const stockMovementsController = require('./stockMovements.controller');
>>>>>>>> 662c9195f1552aabe09dd68a6ae35cbb357ea64d:backend/src/Module/Stock/stockMovements.route.js

router.post('/', authenticate, stockMovementsController.createStockMovement);

router.get('/types', authenticate, stockMovementsController.getStockMovementTypes);

router.get('/', authenticate, stockMovementsController.getAllStockMovements);

router.get('/product/:productId', authenticate, stockMovementsController.getByProduct);

router.get('/:id', authenticate, stockMovementsController.getStockMovementById);

router.put('/:id', authenticate, stockMovementsController.updateStockMovement);

router.delete('/:id', authenticate, stockMovementsController.deleteStockMovement);

module.exports = router;