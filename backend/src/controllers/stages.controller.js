const BaseController = require('./base.controller');
const stageService = require('../services/stages.service');
const asyncHandler = require('../utils/asyncHandler');

class StageController extends BaseController {
  constructor() {
    super(stageService, 'stages');
  }

  findByProtocolId = asyncHandler(async (req, res) => {
    const { protocolId, id } = req.params;
    const targetId = protocolId || id;
    const stages = await this.service.findByProtocolId(targetId);
    res.json(stages);
  });

  reorderStages = asyncHandler(async (req, res) => {
    const { protocolId } = req.params;
    const { stagesOrder } = req.body;
    
    if (!Array.isArray(stagesOrder)) {
      return res.status(400).json({ message: 'stagesOrder deve ser um array' });
    }
    
    const stages = await this.service.reorderStages(protocolId, stagesOrder);
    res.json(stages);
  });

  create = asyncHandler(async (req, res) => {
    const result = await this.service.create(req.validatedBody);
    res.status(201).json(result);
  });

  update = asyncHandler(async (req, res) => {
    const updated = await this.service.update(req.params.id, req.validatedBody);
    res.json(updated);
  });
}

const stageController = new StageController();

exports.getAllStages = stageController.getAll;
exports.getStageById = stageController.getById;
exports.findByProtocolId = stageController.findByProtocolId;
exports.createStage = stageController.create;
exports.updateStage = stageController.update;
exports.deleteStage = stageController.delete;
exports.reorderStages = stageController.reorderStages;