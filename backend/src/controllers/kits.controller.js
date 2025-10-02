const BaseController = require('./base.controller');
const kitService = require('../services/kits.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatPaginatedResponse } = require('../utils/queryBuilder');

class KitController extends BaseController {
  constructor() {
    super(kitService, 'kits');
  }

  create = asyncHandler(async (req, res) => {
    const additionalData = req.user ? { createdBy: req.user.id } : {};
    const result = await this.service.createWithProducts(req.body, additionalData);
    res.status(201).json(result);
  });

  update = asyncHandler(async (req, res) => {
    const result = await this.service.updateWithProducts(req.params.id, req.body);
    res.json(result);
  });

  getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await this.service.findAllPaginated(req.query);

    const response = formatPaginatedResponse(result, page, limit, this.entityName);
    res.json(response);
  });
}

const kitController = new KitController();

exports.createKit = kitController.create;
exports.getAllKits = kitController.getAll;
exports.updateKit = kitController.update;
exports.deleteKit = kitController.delete;
exports.getKitById = kitController.getById;
