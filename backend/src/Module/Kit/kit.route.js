const express = require('express');
const router = express.Router();

const {
  createKit,
  getAllKits,
  getKitById,
  updateKit,
  deleteKit
} = require('./kits.controller');

const {authenticate} = require('../Auth/authMiddleware');

router.get('/', authenticate, getAllKits);

router.get('/:id', authenticate, getKitById);

router.post('/', authenticate, createKit);

router.put('/:id', authenticate, updateKit);

router.delete('/:id', authenticate, deleteKit);

module.exports = router;
