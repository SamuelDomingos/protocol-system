const BaseController = require('../Base/base.controller');
const protocolService = require('./protocols.service');
const asyncHandler = require('../../utils/asyncHandler');

class ProtocolController extends BaseController {
  constructor() {
    super(protocolService, 'protocols');
  }

  create = asyncHandler(async (req, res) => {
    const additionalData = req.user ? { createdBy: req.user.id } : {};
    const result = await this.service.create(req.body, additionalData);
    
    res.status(201).json({
      ...result.protocol.toJSON(),
      stages: result.stages
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const query = { ...req.query, isTemplate: false };
    const result = await this.service.findAllPaginated(query);
    res.json(result);
  });

  validateClient = asyncHandler(async (req, res) => {
    const { clientId, isTemplate } = req.body;
    const isValid = await this.service.validateClient(clientId, isTemplate);
    res.json({ valid: isValid });
  });

  getAllTemplates = asyncHandler(async (req, res) => {
    const query = { ...req.query, isTemplate: true };
    const result = await this.service.findAllPaginated(query);
    res.json(result);
  });

  getTemplateById = asyncHandler(async (req, res) => {
    const template = await this.service.findById(req.params.id);
    
    res.json(template);
  });
}

const protocolController = new ProtocolController();

exports.createProtocol = protocolController.create;
exports.getAllProtocols = protocolController.getAll;
exports.getProtocolById = protocolController.getById;
exports.updateProtocol = protocolController.update;
exports.deleteProtocol = protocolController.delete;
exports.validateClient = protocolController.validateClient;
exports.getAllTemplates = protocolController.getAllTemplates;
exports.getTemplateById = protocolController.getTemplateById;
