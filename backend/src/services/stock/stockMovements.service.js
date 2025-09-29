const BaseService = require('../base.service');
const { StockMovement } = require('../../models/stock/StockMovement');
const StockLocation = require('../../models/stock/StockLocation');
const { Product, Supplier, User } = require('../../models');
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
    
    // Buscar localizações e formatar como arrays
    const simplifiedRows = await Promise.all(
      result.rows.map(async (movement) => {
        const data = movement.toJSON();
        
        // Buscar localização de origem
        let fromLocation = null;
        if (data.fromLocationId) {
          const location = await Supplier.findByPk(data.fromLocationId, {
            attributes: ['id', 'name']
          });
          fromLocation = location ? { id: location.id, name: location.name } : null;
        }
        
        // Buscar localização de destino
        let toLocation = null;
        if (data.toLocationId) {
          const location = await Supplier.findByPk(data.toLocationId, {
            attributes: ['id', 'name']
          });
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

  async createMovement(movementData) {
    return this.transaction(async (transaction) => {
      const movement = await this.model.create(movementData, { transaction });

      switch (movementData.type) {
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

      return movement;
    });
  }

  async processEntrada(movementData, transaction) {
    const { productId, quantity, sku, expiryDate, unitPrice } = movementData;
    
    const internalSupplier = await Supplier.findOne({ 
      where: { type: 'unit' }, 
      transaction 
    });
    
    if (!internalSupplier) {
      throw new Error('Fornecedor interno não encontrado');
    }

    const [stockLocation] = await StockLocation.findOrCreate({
      where: { 
        productId, 
        location: internalSupplier.id 
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
    const { productId, quantity } = movementData;
    
    const internalSupplier = await Supplier.findOne({ 
      where: { type: 'unit' }, 
      transaction 
    });
    
    if (!internalSupplier) {
      throw new Error('Fornecedor interno não encontrado');
    }

    const stockLocation = await StockLocation.findOne({
      where: { 
        productId, 
        location: internalSupplier.id 
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

    await toLocation.update({
      quantity: toLocation.quantity + quantity
    }, { transaction });
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