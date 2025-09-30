const BaseService = require('../base.service');
const Product = require('../../models/stock/Product');
const { Op } = require('sequelize');
const productSchema = require('../../validation/products.schema');

class ProductsService extends BaseService {
  constructor() {
    super(Product, productSchema);
  }

  _buildWhereClause({ name, category, status, minPrice, maxPrice, search }) {
    const where = {};
    
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (category) where.category = { [Op.like]: `%${category}%` };
    if (status) where.status = status;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.unitPrice = {};
      if (minPrice !== undefined) where.unitPrice[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.unitPrice[Op.lte] = maxPrice;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
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

  async getCategories() {
    const categories = await this.model.findAll({
      attributes: ['category'],
      where: { category: { [Op.ne]: null }, status: 'active' },
      group: ['category'],
      order: [['category', 'ASC']]
    });
    return categories.map(item => item.category).filter(Boolean);
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

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: ['name', 'description', 'category'],
      filterFields: ['category', 'status'],
      includes: [],
      defaultSort: [['createdAt', 'DESC']]
    };

    return await super.findAllPaginated(query, filterOptions);
  }
}

module.exports = new ProductsService();