const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/stock/products.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

router.post('/', authenticate, productsController.create);
router.get('/', authenticate, productsController.getAll);
router.get('/categories', authenticate, productsController.getCategories);
router.get('/brands', authenticate, productsController.getBrands);
router.get('/sku/:sku', authenticate, productsController.getBySku);
router.get('/barcode/:barcode', authenticate, productsController.getByBarcode);
router.get('/:id', authenticate, productsController.getById);
router.put('/:id', authenticate, productsController.update);
router.patch('/:id/toggle-active', authenticate, productsController.toggleActive);
router.delete('/:id', authenticate, productsController.delete);

module.exports = router;