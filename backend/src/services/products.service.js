const BaseService = require('./base.service');
const Product = require('../models/Product');
const StockLocation = require('../models/StockLocation');
const Joi = require('joi');
const { Op } = require('sequelize');

class ProductsService extends BaseService {
  constructor() {
    super(Product);
    this.validationSchema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().allow('', null),
      unit: Joi.string().default('unidade'),
      category: Joi.string().allow('', null),
      minimumStock: Joi.number().integer().min(0).default(5),
      status: Joi.string().valid('active', 'inactive').default('active'),
      specifications: Joi.object().default({}),
      sku: Joi.string().allow('', null),
      barcode: Joi.string().allow('', null),
      supplier: Joi.string().allow('', null),
      unitPrice: Joi.number().precision(2).min(0).allow(null),
      brand: Joi.string().allow('', null)
    });
  }

  _buildWhereClause({ name, category, status, minPrice, maxPrice, supplier, brand }) {
    const where = {};
    
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (category) where.category = { [Op.iLike]: `%${category}%` };
    if (status) where.status = status;
    if (supplier) where.supplier = { [Op.iLike]: `%${supplier}%` };
    if (brand) where.brand = { [Op.iLike]: `%${brand}%` };
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.unitPrice = {};
      if (minPrice !== undefined) where.unitPrice[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.unitPrice[Op.lte] = maxPrice;
    }

    return where;
  }

  _enrichWithStock(product) {
    const totalQuantity = (product.stockLocations || [])
      .reduce((sum, loc) => sum + (loc.quantity || 0), 0);
    
    return {
      ...product.toJSON(),
      totalQuantity,
      inventoryStatus: totalQuantity < product.minimumStock ? 'baixo' : 'ok'
    };
  }

  async _findWithStock(where, options = {}) {
    return await this.model.findOne({
      where,
      include: [{ model: StockLocation, as: 'stockLocations', required: false }],
      ...options
    });
  }

  async _validateUnique(field, value, excludeId = null) {
    if (!value) return;
    
    const where = { [field]: value };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    
    const existing = await this.model.findOne({ where });
    if (existing) {
      const fieldName = field === 'sku' ? 'SKU' : 'Código de barras';
      throw new Error(`${fieldName} já existe`);
    }
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10, lowStock, ...filterOptions } = options;
    const where = this._buildWhereClause(filterOptions);
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [{ model: StockLocation, as: 'stockLocations', required: false }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    let productsWithStock = rows.map(product => this._enrichWithStock(product));
    
    if (lowStock === 'true') {
      productsWithStock = productsWithStock.filter(p => p.inventoryStatus === 'baixo');
    }

    return {
      data: productsWithStock,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  async findById(id) {
    const product = await this._findWithStock({ id });
    if (!product) throw new Error('Produto não encontrado');
    return this._enrichWithStock(product);
  }

  async findBySku(sku) {
    if (!sku) throw new Error('SKU é obrigatório');
    const product = await this._findWithStock({ sku });
    if (!product) throw new Error('Produto não encontrado');
    return this._enrichWithStock(product);
  }

  async findByBarcode(barcode) {
    if (!barcode) throw new Error('Código de barras é obrigatório');
    const product = await this._findWithStock({ barcode });
    if (!product) throw new Error('Produto não encontrado');
    return this._enrichWithStock(product);
  }

  async getCategories() {
    const categories = await this.model.findAll({
      attributes: ['category'],
      where: { category: { [Op.ne]: null }, status: 'active' },
      group: ['category'],
      order: [['category', 'ASC']]
    });
    return categories.map(item => item.category).filter(Boolean);
  }

  async getBrands() {
    const brands = await this.model.findAll({
      attributes: ['brand'],
      where: { brand: { [Op.ne]: null }, status: 'active' },
      group: ['brand'],
      order: [['brand', 'ASC']]
    });
    return brands.map(item => item.brand).filter(Boolean);
  }

  async getLowStockProducts() {
    const products = await this.model.findAll({
      include: [{ model: StockLocation, as: 'stockLocations', required: false }],
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });

    return products
      .map(product => this._enrichWithStock(product))
      .filter(product => product.totalQuantity < product.minimumStock);
  }

  async toggleActive(id) {
    const product = await this.findById(id);
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    return await this.update(id, { status: newStatus });
  }

  async create(data) {
    await this._validateUnique('sku', data.sku);
    await this._validateUnique('barcode', data.barcode);
    return await super.create(data);
  }

  async update(id, data) {
    const existingProduct = await this.findById(id);
    
    if (data.sku && data.sku !== existingProduct.sku) {
      await this._validateUnique('sku', data.sku, id);
    }
    
    if (data.barcode && data.barcode !== existingProduct.barcode) {
      await this._validateUnique('barcode', data.barcode, id);
    }

    return await super.update(id, data);
  }
}

module.exports = new ProductsService();