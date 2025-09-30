const BaseService = require('../base.service');
const { StockMovement } = require('../../models/stock/StockMovement');
const StockLocation = require('../../models/stock/StockLocation');
const { Product, Supplier, User, Client } = require('../../models');
const { stockMovementSchema } = require('../../validation/stockMovementSchema');

class StockMovementsService extends BaseService {
  constructor() {
    super(StockMovement, stockMovementSchema, [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'unit']
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }
    ]);
  }

  async createMovement(movementData) {
    return this.transaction(async (transaction) => {
      await this.validateLocations(movementData, transaction);

      const movement = await this.model.create(movementData, { transaction });

      await this.processStock(movementData, transaction);

      return movement;
    });
  }

  async validateLocations(movementData, transaction) {
    const { type, fromLocationId, fromLocationType, toLocationId, toLocationType } = movementData;

    if (fromLocationId && fromLocationType) {
      await this.validateLocationExists(fromLocationId, fromLocationType, transaction);
    }

    if (toLocationId && toLocationType) {
      await this.validateLocationExists(toLocationId, toLocationType, transaction);
    }
  }

  async validateLocationExists(locationId, locationType, transaction) {
    const models = {
      supplier: Supplier,
      user: User,
      client: Client
    };

    const model = models[locationType];
    if (!model) {
      throw new Error(`Tipo de localização inválido: ${locationType}`);
    }

    const location = await model.findByPk(locationId, { transaction });
    if (!location) {
      throw new Error(`${locationType} com ID ${locationId} não foi encontrado`);
    }

    return location;
  }

  async processStock(movementData, transaction) {
    const { type } = movementData;

    switch (type) {
      case 'entrada':
        await this.processEntrada(movementData, transaction);
        break;
      case 'saida':
        await this.processSaida(movementData, transaction);
        break;
      case 'transferencia':
        await this.processTransferencia(movementData, transaction);
        break;
    }
  }

  async processEntrada(movementData, transaction) {
    const { productId, quantity, sku, expiryDate, unitPrice, toLocationId } = movementData;

    const [stockLocation] = await StockLocation.findOrCreate({
      where: { 
        productId, 
        location: toLocationId 
      },
      defaults: { 
        quantity: 0, 
        price: unitPrice || 0,
        sku: sku || null,
        expiryDate: expiryDate || null
      },
      transaction
    });

    await stockLocation.update({
      quantity: stockLocation.quantity + quantity,
      price: unitPrice || stockLocation.price,
      sku: sku || stockLocation.sku,
      expiryDate: expiryDate || stockLocation.expiryDate
    }, { transaction });
  }

  async processSaida(movementData, transaction) {
    const { productId, quantity, fromLocationId } = movementData;
    
    // Para saída, precisamos de um local de origem (supplier)
    const stockLocation = await StockLocation.findOne({
      where: { 
        productId, 
        location: fromLocationId 
      },
      transaction
    });

    if (!stockLocation || stockLocation.quantity < quantity) {
      throw new Error('Estoque insuficiente');
    }

    await stockLocation.update({
      quantity: stockLocation.quantity - quantity
    }, { transaction });
  }

  async processTransferencia(movementData, transaction) {
    const { productId, quantity, fromLocationId, toLocationId } = movementData;
    
    // Origem
    const fromLocation = await StockLocation.findOne({
      where: { 
        productId, 
        location: fromLocationId 
      },
      transaction
    });

    if (!fromLocation || fromLocation.quantity < quantity) {
      throw new Error('Estoque insuficiente no local de origem');
    }

    // Reduzir estoque da origem
    await fromLocation.update({
      quantity: fromLocation.quantity - quantity
    }, { transaction });

    // Destino
    const [toLocation] = await StockLocation.findOrCreate({
      where: { 
        productId, 
        location: toLocationId 
      },
      defaults: { 
        quantity: 0, 
        price: fromLocation.price,
        sku: fromLocation.sku,
        expiryDate: fromLocation.expiryDate
      },
      transaction
    });

    // Aumentar estoque do destino
    await toLocation.update({
      quantity: toLocation.quantity + quantity
    }, { transaction });
  }

  async getLocationByTypeAndId(locationId, locationType) {
    const models = {
      supplier: Supplier,
      user: User,
      client: Client
    };

    const model = models[locationType];
    return model ? await model.findByPk(locationId) : null;
  }

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: ['type', 'notes'],
      filterFields: ['type', 'productId', 'userId'],
      includes: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'unit']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ],
      defaultSort: [['createdAt', 'DESC']]
    };

    const result = await super.findAllPaginated(query, filterOptions);

    const simplifiedRows = await Promise.all(
      result.rows.map(async (movement) => {
        const data = movement.toJSON();

        let fromLocation = null;
        if (data.fromLocationId && data.fromLocationType) {
          const location = await this.getLocationByTypeAndId(data.fromLocationId, data.fromLocationType);
          fromLocation = location ? { id: location.id, name: location.name } : null;
        }

        let toLocation = null;
        if (data.toLocationId && data.toLocationType) {
          const location = await this.getLocationByTypeAndId(data.toLocationId, data.toLocationType);
          toLocation = location ? { id: location.id, name: location.name } : null;
        }

        return {
          id: data.id,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          createdAt: data.createdAt,
          fromLocation: fromLocation,
          toLocation: toLocation,
          product: data.product,
          user: data.user
        };
      })
    );

    return {
      count: result.count,
      rows: simplifiedRows
    };
  }

  async findByProduct(productId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where: { productId },
      include: this.defaultIncludes,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      movements: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  }
}

module.exports = new StockMovementsService();
