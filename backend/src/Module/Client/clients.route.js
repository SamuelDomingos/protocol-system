
const express = require('express');
const router = express.Router();
const clientsController = require('./clients.controller');
const { authenticate } = require('../Auth/authMiddleware');

router.post(
  '/',
  authenticate,
  clientsController.createClient
);

router.get('/', authenticate, clientsController.getAllClients);

router.put(
  '/:id',
  authenticate,
  clientsController.updateClient
);

router.delete('/:id', authenticate, clientsController.deleteClient);

module.exports = router;
