const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/stock/products.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

router.post('/', authenticate, productsController.create);
router.get('/', authenticate, productsController.getAll);
router.get('/categories', authenticate, productsController.getCategories);
router.get('/low-stock', authenticate, productsController.getLowStock);
router.get('/near-expiry', authenticate, productsController.getNearExpiry);
router.get('/:id', authenticate, productsController.getById);
router.put('/:id', authenticate, productsController.update);
router.patch('/:id/toggle-active', authenticate, productsController.toggleActive);
router.delete('/:id', authenticate, productsController.delete);

module.exports = router;