// routes/clients.js
const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const { validateBody, checkCpfUnique } = require('../middlewares/clientsMiddlewares');
const clientSchema = require('../validation/clientSchema');
const Client = require('../models/Client');

router.post(
  '/',
  validateBody(clientSchema),
  checkCpfUnique(Client),
  clientsController.createClient
);

router.get('/', clientsController.getAllClients);

router.put(
  '/:id',
  validateBody(clientSchema),
  checkCpfUnique(Client),
  clientsController.updateClient
);

router.delete('/:id', clientsController.deleteClient);

router.get('/search', clientsController.searchClients);

module.exports = router;
