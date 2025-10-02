const asyncHandler = require('../../utils/asyncHandler');
const { formatPaginatedResponse } = require('../../utils/queryBuilder');

class BaseController {
  constructor(service, entityName = 'data') {
    this.service = service;
    this.entityName = entityName;

    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  create = asyncHandler(async (req, res) => {
    const additionalData = req.user ? { createdBy: req.user.id } : {};
    const result = await this.service.create(req.body, additionalData);
    res.status(201).json(result);
  });

  getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const searchQuery = req.query.search;

    let result;

    if (searchQuery && searchQuery.trim()) {
      const searchResults = await this.service.search(searchQuery);
      result = {
        rows: searchResults,
        count: searchResults.length
      };
    } else {
      result = await this.service.findAllPaginated(req.query);
    }

    const response = formatPaginatedResponse(result, page, limit, this.entityName);
    res.json(response);
  });

  getById = asyncHandler(async (req, res) => {
    const result = await this.service.findById(req.params.id);
    res.json(result);
  });

  update = asyncHandler(async (req, res) => {
    const updated = await this.service.update(req.params.id, req.body);
    res.json(updated);
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.json({ message: `${this.entityName} deleted successfully` });
  });
}

module.exports = BaseController;