const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { authenticate } = require('../Auth/authMiddleware');

router.get('/', authenticate, usersController.getAllUsers);
router.get('/:id', authenticate, usersController.getUserById);
router.put('/:id', authenticate, usersController.update);
router.delete('/:id', authenticate, usersController.delete);
router.get('/:id/permissions', authenticate, usersController.getUserPermissions);

module.exports = router;