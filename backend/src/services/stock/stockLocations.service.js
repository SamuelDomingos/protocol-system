const BaseService = require('../base.service');
const StockLocation = require('../../models/stock/StockLocation');
const stockLocationSchema = require('../../validation/stockLocationSchema');

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