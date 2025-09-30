const BaseService = require('../base.service');
const Product = require('../../models/stock/Product');
const { Op } = require('sequelize');
const productSchema = require('../../validation/products.schema');
const stockLocationsService = require('./stockLocations.service');
    const StockLocation = require('../../models/stock/StockLocation');
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

    const productsWithStock = await Promise.all(rows.map(async (product) => {
      const totalQuantity = await stockLocationsService.getTotalQuantityByProduct(product.id);
      const totalPrice = totalQuantity * product.unitPrice;
      return { ...product.toJSON(), totalQuantity, totalPrice };
    }));

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

  async getProductsWithLowStock(options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const products = await this.model.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });

    const lowStockProducts = [];
    
    for (const product of products) {
      const totalQuantity = await stockLocationsService.getTotalQuantityByProduct(product.id);
      
      if (totalQuantity <= product.minimumStock) {
        const productData = product.toJSON();
        lowStockProducts.push({
          ...productData,
          currentStock: totalQuantity,
          stockDifference: totalQuantity - product.minimumStock,
          totalValue: totalQuantity * product.unitPrice
        });
      }
    }

    const totalItems = lowStockProducts.length;
    const paginatedProducts = lowStockProducts.slice(offset, offset + parseInt(limit));

    return {
      data: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  async getProductsNearExpiry(options = {}) {
    const { page = 1, limit = 10, daysUntilExpiry = 30 } = options;
    const offset = (page - 1) * limit;

    const currentDate = new Date();
    const expiryLimitDate = new Date();
    expiryLimitDate.setDate(currentDate.getDate() + parseInt(daysUntilExpiry));
    
    const stockLocations = await StockLocation.findAll({
      where: {
        expiryDate: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.lte]: expiryLimitDate },
            { [Op.gte]: currentDate }
          ]
        },
        quantity: { [Op.gt]: 0 }
      },
      include: [{
        model: Product,
        as: 'product',
        where: { status: 'active' },
        attributes: ['id', 'name', 'unit', 'unitPrice', 'category', 'minimumStock']
      }],
      order: [['expiryDate', 'ASC']]
    });

    const nearExpiryProducts = stockLocations.map(location => {
      const daysUntilExpiry = Math.ceil((new Date(location.expiryDate) - currentDate) / (1000 * 60 * 60 * 24));
      
      return {
        id: location.id,
        productId: location.productId,
        product: location.product,
        location: location.location,
        quantity: location.quantity,
        sku: location.sku,
        expiryDate: location.expiryDate,
        daysUntilExpiry,
        totalValue: location.quantity * location.product.unitPrice,
        isExpired: daysUntilExpiry < 0,
        urgencyLevel: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 15 ? 'medium' : 'low'
      };
    });

    const totalItems = nearExpiryProducts.length;
    const paginatedProducts = nearExpiryProducts.slice(offset, offset + parseInt(limit));

    return {
      data: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      summary: {
        totalNearExpiry: totalItems,
        expired: nearExpiryProducts.filter(p => p.isExpired).length,
        highUrgency: nearExpiryProducts.filter(p => p.urgencyLevel === 'high').length,
        mediumUrgency: nearExpiryProducts.filter(p => p.urgencyLevel === 'medium').length,
        lowUrgency: nearExpiryProducts.filter(p => p.urgencyLevel === 'low').length
      }
    };
  }
}

module.exports = new ProductsService();