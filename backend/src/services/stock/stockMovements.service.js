const BaseService = require('../base.service');
const { StockMovement } = require('../../models/stock/StockMovement');
const StockLocation = require('../../models/stock/StockLocation');
const stockMovementSchema = require('../../validation/stockMovementSchema');
const stockLocationsService = require('./stockLocations.service');
const sequelize = require('../../config/database');

class StockMovementsService extends BaseService {
  constructor() {
    super(StockMovement, stockMovementSchema);
  }

  async createMovement(data) {
    const { value } = this.validate(data);
    
    const transaction = await sequelize.transaction();
    
    try {
      console.log('--- [StockMovementsService.createMovement] ---');
      console.log('Dados validados:', JSON.stringify(value));

      if (value.type === 'entrada') {
        await this._handleEntrada(value, transaction);
      } else if (value.type === 'saida') {
        await this._handleSaida(value, transaction);
      } else if (value.type === 'transferencia') {
        await this._handleTransferencia(value, transaction);
      }

      const stockMovement = await this.model.create(value, { transaction });
      
      await transaction.commit();
      return stockMovement;
    } catch (err) {
      await transaction.rollback();
      console.error('❌ Error creating stock movement:', err);
      throw err;
    }
  }

  async _handleEntrada(data, transaction) {
    let stockLocation = await stockLocationsService.findByProductAndLocationName(
      data.productId, 
      data.locationId
    );

    if (!stockLocation) {
      stockLocation = await StockLocation.create({
        productId: data.productId,
        location: data.locationId,
        quantity: 0,
        price: data.unitPrice || null,
        sku: data.sku || null,
        expiryDate: data.expiryDate || null
      }, { transaction });
    }

    const newQuantity = stockLocation.quantity + data.quantity;
    await stockLocation.update({ quantity: newQuantity }, { transaction });
  }

  async _handleSaida(data, transaction) {
    const stockLocation = await stockLocationsService.findByProductAndLocationName(
      data.productId, 
      data.locationId
    );
    
    if (!stockLocation) {
      throw { status: 400, message: 'Local de estoque não encontrado' };
    }

    if (stockLocation.quantity < data.quantity) {
      throw { status: 400, message: 'Quantidade insuficiente em estoque' };
    }

    const newQuantity = stockLocation.quantity - data.quantity;
    await stockLocation.update({ quantity: newQuantity }, { transaction });
  }

  async _handleTransferencia(data, transaction) {
    const fromLocation = await stockLocationsService.findByProductAndLocationName(
      data.productId, 
      data.fromLocationId
    );
    
    if (!fromLocation) {
      throw { status: 400, message: 'Local de origem não encontrado' };
    }

    if (fromLocation.quantity < data.quantity) {
      throw { status: 400, message: 'Quantidade insuficiente no local de origem' };
    }

    let toLocation = await stockLocationsService.findByProductAndLocationName(
      data.productId, 
      data.toLocationId
    );
    
    if (!toLocation) {
      toLocation = await StockLocation.create({
        productId: data.productId,
        location: data.toLocationId,
        quantity: 0
      }, { transaction });
    }

    await fromLocation.update({ 
      quantity: fromLocation.quantity - data.quantity 
    }, { transaction });
    
    await toLocation.update({ 
      quantity: toLocation.quantity + data.quantity 
    }, { transaction });

  }

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: ['reason', 'notes'],
      filterFields: ['type', 'productId', 'fromLocationId', 'toLocationId', 'userId'],
      includes: [
        {
          model: StockLocation,
          as: 'fromLocation',
          attributes: ['id', 'location', 'sku']
        },
        {
          model: StockLocation,
          as: 'toLocation',
          attributes: ['id', 'location', 'sku']
        }
      ],
      defaultSort: [['createdAt', 'DESC']]
    };

    return await super.findAllPaginated(query, filterOptions);
  }
}

module.exports = new StockMovementsService();