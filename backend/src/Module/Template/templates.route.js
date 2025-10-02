const express = require('express');
const router = express.Router();

const {authenticate} = require('../Auth/authMiddleware');
<<<<<<<< HEAD:backend/src/Module/Protocol/templates.route.js
const protocolsController = require('./protocols.controller');
========
const protocolsController = require('../Protocol/protocols.controller');
>>>>>>>> 662c9195f1552aabe09dd68a6ae35cbb357ea64d:backend/src/Module/Template/templates.route.js
const { findByProtocolId } = require('../Stage/stages.controller');

router.post('/', authenticate, protocolsController.createProtocol);
router.put('/:id', authenticate, protocolsController.updateProtocol);
router.delete('/:id', authenticate, protocolsController.deleteProtocol);
router.get('/', authenticate, protocolsController.getAllTemplates);
router.get('/:id', authenticate, protocolsController.getTemplateById);
router.get('/:id/stages', authenticate, findByProtocolId);

module.exports = router;