const express = require('express');
const router = express.Router();

const {authenticate} = require('../middlewares/authMiddleware');
const protocolsController = require('../controllers/protocols.controller');

router.post('/', authenticate, protocolsController.createProtocol);

router.put('/:id', authenticate, protocolsController.updateProtocol);

router.delete('/:id', authenticate, protocolsController.deleteProtocol);

router.get('/', authenticate, protocolsController.getAllProtocols);

router.get('/:id', authenticate,  protocolsController.getProtocolById);

module.exports = router;