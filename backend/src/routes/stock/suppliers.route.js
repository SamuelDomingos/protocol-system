const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const { validateBody } = require('../../middlewares/clientsMiddlewares');
const supplierSchema = require('../../validation/supplierSchema');
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getByType,
  getByCategory,
  getSuppliers,
  getUnits,
  getCategories,
  searchSuppliers
} = require('../../controllers/stock/suppliers.controller');

router.get('/', authenticate, getAllSuppliers);
router.get('/search', authenticate, searchSuppliers);
router.get('/categories', authenticate, getCategories);
router.get('/suppliers', authenticate, getSuppliers);
router.get('/units', authenticate, getUnits);
router.get('/type/:type', authenticate, getByType);
router.get('/category/:category', authenticate, getByCategory);
router.get('/:id', authenticate, getSupplierById);

router.post('/', 
  authenticate, 
  validateBody(supplierSchema), 
  createSupplier
);

router.put('/:id', 
  authenticate, 
  validateBody(supplierSchema), 
  updateSupplier
);

router.delete('/:id', authenticate, deleteSupplier);

module.exports = router;