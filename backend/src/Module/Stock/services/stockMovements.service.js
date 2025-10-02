const BaseService = require('../../Base/base.service');
const { StockMovement } = require('../models/StockMovement');
const StockLocation = require('../models/StockLocation');
const { Product, Supplier, User, Client } = require('../../Index');
const { stockMovementSchema } = require('../validation/stockMovementSchema');

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
    const { value } = this.validate(movementData);
    
    return this.transaction(async (transaction) => {
      await this.validateLocations(value, transaction);

      const movement = await this.model.create(value, { transaction });

      await this.processStock(value, transaction);

      return movement;
    });
  }

  async validateLocations(movementData, transaction) {
    const { fromLocationId, fromLocationType, toLocationId, toLocationType } = movementData;

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
    if (query.search) {
      return await this.searchMovements(query);
    }

    const filterOptions = {
      searchFields: ['type', 'reason', 'notes'],
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

  async search(term) {
    if (!term?.trim()) return [];

    const { Op } = require('sequelize');

    const [suppliers, users, clients] = await Promise.all([
      Supplier.findAll({
        where: { name: { [Op.like]: `%${term}%` } },
        attributes: ['id']
      }),
      User.findAll({
        where: { name: { [Op.like]: `%${term}%` } },
        attributes: ['id']
      }),
      Client.findAll({
        where: { name: { [Op.like]: `%${term}%` } },
        attributes: ['id']
      })
    ]);

    const supplierIds = suppliers.map(s => s.id);
    const userIds = users.map(u => u.id);
    const clientIds = clients.map(c => c.id);

    const searchConditions = [
      { type: { [Op.like]: `%${term}%` } },
      { reason: { [Op.like]: `%${term}%` } },
      { notes: { [Op.like]: `%${term}%` } },
      
      // Busca por usuário que fez a movimentação
      ...(userIds.length > 0 ? [{ userId: { [Op.in]: userIds } }] : []),
      
      ...(supplierIds.length > 0 ? [{ 
        fromLocationId: { [Op.in]: supplierIds },
        fromLocationType: 'supplier'
      }] : []),
      ...(userIds.length > 0 ? [{ 
        fromLocationId: { [Op.in]: userIds },
        fromLocationType: 'user'
      }] : []),
      ...(clientIds.length > 0 ? [{ 
        fromLocationId: { [Op.in]: clientIds },
        fromLocationType: 'client'
      }] : []),
      
      // Busca por localização de destino
      ...(supplierIds.length > 0 ? [{ 
        toLocationId: { [Op.in]: supplierIds },
        toLocationType: 'supplier'
      }] : []),
      ...(userIds.length > 0 ? [{ 
        toLocationId: { [Op.in]: userIds },
        toLocationType: 'user'
      }] : []),
      ...(clientIds.length > 0 ? [{ 
        toLocationId: { [Op.in]: clientIds },
        toLocationType: 'client'
      }] : [])
    ];

    const movements = await this.model.findAll({
      where: {
        [Op.or]: searchConditions
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'unit'],
          where: {
            name: { [Op.like]: `%${term}%` }
          },
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          where: {
            name: { [Op.like]: `%${term}%` }
          },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Processar os resultados para incluir informações de localização
    const simplifiedRows = await Promise.all(
      movements.map(async (movement) => {
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

    return simplifiedRows;
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

    const processedMovements = await Promise.all(
      rows.map(async (movement) => {
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
          notes: data.notes,
          totalValue: data.totalValue,
          unitPrice: data.unitPrice,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          fromLocation: fromLocation,
          toLocation: toLocation,
          product: data.product,
          user: data.user
        };
      })
    );

    return {
      movements: processedMovements,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  }
}

module.exports = new StockMovementsService();
