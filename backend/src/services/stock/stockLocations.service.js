const BaseService = require('../base.service');
const StockLocation = require('../../models/stock/StockLocation');
const Product = require('../../models/stock/Product');
const stockLocationSchema = require('../../validation/stockLocationSchema');
const Supplier = require('../../models/stock/Supplier');

class StockLocationsService extends BaseService {
  constructor() {
    super(StockLocation, stockLocationSchema);
  }

  async findByProductAndLocationName(productId, locationName) {
    return await this.model.findOne({
      where: {
        productId: productId,
        location: locationName
      }
    });
  }

  async findByProductId(productId) {
    return await this.model.findAll({
      where: { productId },
      include: [{
        model: Supplier,
        as: 'supplierLocation',
        attributes: ['id', 'name']
      }],
      order: [['location', 'ASC']]
    });
  }

  async updateQuantity(id, quantity) {
    const stockLocation = await this.findById(id);
    return await stockLocation.update({ quantity });
  }

  async getTotalQuantityByProduct(productId) {
    const locations = await this.findByProductId(productId);
    return locations.reduce((total, location) => total + (location.quantity || 0), 0);
  }

  async findProductsByLocation(locationId) {
    return await this.model.findAll({
      where: { 
        location: locationId,
        quantity: { [require('sequelize').Op.gt]: 0 }
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'unit', 'unitPrice']
      }],
      order: [['product', 'name', 'ASC']]
    });
  }

  async findBatchesByProductAndLocation(productId, locationId) {
    return await this.model.findAll({
      where: { 
        productId,
        location: locationId,
        quantity: { [require('sequelize').Op.gt]: 0 }
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'unit', 'unitPrice']
      }],
      order: [['expiryDate', 'ASC'], ['sku', 'ASC']]
    });
  }

  async findAllBatchesByProduct(productId) {
    return await this.model.findAll({
      where: { 
        productId,
        quantity: { [require('sequelize').Op.gt]: 0 }
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'unit', 'unitPrice']
        },
        {
          model: Supplier,
          as: 'supplierLocation',
          attributes: ['id', 'name']
        }
      ],
      order: [['location', 'ASC'], ['expiryDate', 'ASC'], ['sku', 'ASC']]
    });
  }

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: ['location', 'sku'],
      filterFields: ['productId', 'location'],
      includes: [],
      defaultSort: [['createdAt', 'DESC']]
    };

    return await super.findAllPaginated(query, filterOptions);
  }
}

module.exports = new StockLocationsService();