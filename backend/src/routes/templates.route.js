const express = require('express');
const router = express.Router();

const {authenticate} = require('../middlewares/authMiddleware');
const protocolsController = require('../controllers/protocols.controller');
const { findByProtocolId } = require('../controllers/stages.controller');

router.post('/', authenticate, protocolsController.createProtocol);
router.put('/:id', authenticate, protocolsController.updateProtocol);
router.delete('/:id', authenticate, protocolsController.deleteProtocol);
router.get('/', authenticate, protocolsController.getAllTemplates);
router.get('/:id', authenticate, protocolsController.getTemplateById);
router.get('/:id/stages', authenticate, findByProtocolId);

module.exports = router;