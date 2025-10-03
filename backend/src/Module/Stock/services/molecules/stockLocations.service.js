
const BaseService = require('../../Base/base.service');
const StockLocation = require('../models/StockLocation');
const Product = require('../../Product/Product');
const stockLocationSchema = require('../validation/stockLocationSchema');
const Supplier = require('../../Supplier/Supplier');

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
    const { Op, literal, fn, col } = require('sequelize');
    
    return await this.model.findAll({
      attributes: [
        'location',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [literal(`(
          SELECT COALESCE(SUM(sm.totalValue), 0)
          FROM stock_movements sm
          WHERE sm.productId = StockLocation.productId
          AND sm.type = 'entrada'
          AND sm.toLocationId = StockLocation.location
        )`), 'totalPrice'],
        [col('supplierLocation.name'), 'locationName']
      ],
      where: { 
        productId,
        quantity: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Supplier,
          as: 'supplierLocation',
          attributes: [],
          required: true
        }
      ],
      group: ['location', 'supplierLocation.id'],
      order: [['location', 'ASC']]
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