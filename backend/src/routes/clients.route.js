
const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const { validateBody, checkCpfUnique } = require('../middlewares/clientsMiddlewares');
const clientSchema = require('../validation/clientSchema');
const Client = require('../models/Client');
const { authenticate } = require('../middlewares/authMiddleware');

router.post(
  '/',
  authenticate,
  validateBody(clientSchema),
  checkCpfUnique(Client),
  clientsController.createClient
);

router.get('/', authenticate, clientsController.getAllClients);

router.put(
  '/:id',
  authenticate,
  validateBody(clientSchema),
  checkCpfUnique(Client),
  clientsController.updateClient
);

router.delete('/:id', authenticate, clientsController.deleteClient);

module.exports = router;
