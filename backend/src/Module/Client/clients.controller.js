const BaseController = require('../Base/base.controller');
const clientService = require('./clients.service');
const asyncHandler = require('../../utils/asyncHandler');

class ClientController extends BaseController {
  constructor() {
    super(clientService, 'clients');
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.findAllPaginated(req.query);
    
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const response = {
      clients: result.rows,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(result.count / limitNum),
        totalItems: result.count,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(result.count / limitNum),
        hasPreviousPage: pageNum > 1
      }
    };
    
    res.json(response);
  });

  create = asyncHandler(async (req, res) => {
    const additionalData = req.user ? { createdBy: req.user.id } : {};
    const result = await this.service.create(req.validatedBody, additionalData);
    res.status(201).json(result);
  });

  update = asyncHandler(async (req, res) => {
    const updated = await this.service.update(req.params.id, req.validatedBody);
    res.json(updated);
  });
}

const clientController = new ClientController();

exports.createClient = clientController.create;
exports.getAllClients = clientController.getAll;
exports.updateClient = clientController.update;
exports.deleteClient = clientController.delete;
exports.getClientById = clientController.getById;
