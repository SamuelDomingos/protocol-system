const BaseController = require('../Base/base.controller');
const productsService = require('./products.service');
const asyncHandler = require('../../utils/asyncHandler');

class ProductsController extends BaseController {
  constructor() {
    super(productsService);
  }

  _findByField = (field) => asyncHandler(async (req, res) => {
    const value = req.params[field];
    const method = field === 'sku' ? 'findBySku' : 'findByBarcode';
    const product = await this.service[method](value);
    res.json(product);
  });

  _getList = (method) => asyncHandler(async (req, res) => {
    const data = await this.service[method]();
    res.json(data);
  });

  _handleCRUD = (method, successMessage) => asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const data = method === 'create' 
        ? await this.service[method](req.body)
        : await this.service[method](id, req.body);
      
      const statusCode = method === 'create' ? 201 : 200;
      res.status(statusCode).json({
        message: successMessage,
        data
      });
    } catch (error) {
      if (this._isValidationError(error)) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  });

  _isValidationError(error) {
    return error.message.includes('SKU já existe') || 
           error.message.includes('Código de barras já existe');
  }

  getCategories = this._getList('getCategories');

  create = this._handleCRUD('create', 'Produto criado com sucesso');
  update = this._handleCRUD('update', 'Produto atualizado com sucesso');
  delete = this._handleCRUD('delete', 'Produto excluído com sucesso');
  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.findAll(req.query);
    res.json(result);
  });

  getLowStock = asyncHandler(async (req, res) => {
    const result = await this.service.getProductsWithLowStock(req.query);
    res.json(result);
  });

  getNearExpiry = asyncHandler(async (req, res) => {
    const result = await this.service.getProductsNearExpiry(req.query);
    res.json(result);
  });

  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await this.service.findById(id);
    res.json(product);
  });

  toggleActive = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await this.service.toggleActive(id);
    res.json({
      message: 'Status do produto alterado com sucesso',
      data: product
    });
  });
}

module.exports = new ProductsController();