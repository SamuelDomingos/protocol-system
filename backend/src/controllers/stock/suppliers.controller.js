const BaseController = require('../base.controller');
const suppliersService = require('../../services/stock/suppliers.service');
const asyncHandler = require('../../utils/asyncHandler');

class SuppliersController extends BaseController {
  constructor() {
    super(suppliersService);
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.findAllPaginated(req.query);
    res.json(result);
  });

  getByType = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const suppliers = await this.service.findByType(type);
    res.json(suppliers);
  });

  getByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const suppliers = await this.service.findByCategory(category);
    res.json(suppliers);
  });

  getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await this.service.getSuppliers();
    res.json(suppliers);
  });

  getUnits = asyncHandler(async (req, res) => {
    const units = await this.service.getUnits();
    res.json(units);
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await this.service.getCategories();
    res.json(categories);
  });

  search = asyncHandler(async (req, res) => {
    const { term } = req.query;
    const suppliers = await this.service.search(term);
    res.json(suppliers);
  });

  create = asyncHandler(async (req, res) => {
    try {
      const supplier = await this.service.create(req.body);
      res.status(201).json({
        message: 'Fornecedor criado com sucesso',
        data: supplier
      });
    } catch (error) {
      if (this._isValidationError(error)) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await this.service.update(id, req.body);
      res.json({
        message: 'Fornecedor atualizado com sucesso',
        data: supplier
      });
    } catch (error) {
      if (this._isValidationError(error)) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  });

  _isValidationError(error) {
    return error.name === 'ValidationError' || 
           error.message.includes('validation') ||
           error.message.includes('required') ||
           error.message.includes('invalid');
  }
}

const suppliersController = new SuppliersController();

module.exports = {
  createSupplier: suppliersController.create,
  getAllSuppliers: suppliersController.getAll,
  getSupplierById: suppliersController.getById,
  updateSupplier: suppliersController.update,
  deleteSupplier: suppliersController.delete,
  getByType: suppliersController.getByType,
  getByCategory: suppliersController.getByCategory,
  getSuppliers: suppliersController.getSuppliers,
  getUnits: suppliersController.getUnits,
  getCategories: suppliersController.getCategories,
  searchSuppliers: suppliersController.search
};