const express = require('express');
const router = express.Router();
const { authenticate } = require('../Auth/authMiddleware');
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
} = require('./suppliers.controller');

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
  createSupplier
);

router.put('/:id', 
  authenticate, 
  updateSupplier
);

router.delete('/:id', authenticate, deleteSupplier);

module.exports = router;