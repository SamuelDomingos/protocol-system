const BaseService = require('../base.service');
const Product = require('../../models/stock/Product');
const { Op } = require('sequelize');
const productSchema = require('../../validation/products.schema');

class ProductsService extends BaseService {
  constructor() {
    super(Product, productSchema);
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

  async findAll(options = {}) {
    const { page = 1, limit = 10, ...filterOptions } = options;
    const where = this._buildWhereClause(filterOptions);
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  async findById(id) {
    const product = await this.model.findByPk(id);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  }

  async findBySku(sku) {
    if (!sku) throw new Error('SKU é obrigatório');
    const product = await this.model.findOne({ where: { sku } });
    if (!product) throw new Error('Produto não encontrado');
    return product;
  }

  async findByBarcode(barcode) {
    if (!barcode) throw new Error('Código de barras é obrigatório');
    const product = await this.model.findOne({ where: { barcode } });
    if (!product) throw new Error('Produto não encontrado');
    return product;
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

  async toggleActive(id) {
    const product = await this.findById(id);
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    return await this.update(id, { status: newStatus });
  }

  async create(data) {
    return await super.create(data);
  }

  async update(id, data) {
    return await super.update(id, data);
  }
}

module.exports = new ProductsService();