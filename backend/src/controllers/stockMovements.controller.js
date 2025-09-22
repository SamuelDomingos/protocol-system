const StockMovement = require('../models/StockMovement');
const StockLocation = require('../models/StockLocation');
const { findByProductAndLocationName } = require('./stockLocations.controller');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { buildAdvancedFilters, formatPaginatedResponse } = require('../utils/queryBuilder');

exports.createStockMovement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Usuário não autenticado.' });
    }

    const data = { ...req.body, userId };
    console.log('--- [StockMovementsController.create] ---');
    console.log('Dados recebidos:', JSON.stringify(data));
    console.log('userId:', userId);

    if (data.type === 'in') {
      let stockLocation = null;

      // Buscar StockLocation para productId + location
      if (data.locationId && data.productId) {
        stockLocation = await findByProductAndLocationName(data.productId, data.locationId);
        console.log('[IN] StockLocation encontrada:', stockLocation);

        // Se não existir, criar StockLocation
        if (!stockLocation) {
          console.log('[IN] Criando nova StockLocation');
          stockLocation = await StockLocation.create({
            productId: data.productId,
            location: data.locationId,
            quantity: 0,
            price: data.unitCost || null,
            sku: data.sku || null,
            expiryDate: data.expiryDate || null
          }, { transaction });
        }

        // Atualizar quantidade
        const newQuantity = stockLocation.quantity + data.quantity;
        await stockLocation.update({ quantity: newQuantity }, { transaction });
        console.log(`[IN] Quantidade atualizada: ${stockLocation.quantity} -> ${newQuantity}`);
      }
    } else if (data.type === 'out') {
      // Lógica para saída de estoque
      if (data.locationId && data.productId) {
        const stockLocation = await findByProductAndLocationName(data.productId, data.locationId);
        
        if (!stockLocation) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Local de estoque não encontrado' });
        }

        if (stockLocation.quantity < data.quantity) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
        }

        const newQuantity = stockLocation.quantity - data.quantity;
        await stockLocation.update({ quantity: newQuantity }, { transaction });
        console.log(`[OUT] Quantidade atualizada: ${stockLocation.quantity} -> ${newQuantity}`);
      }
    } else if (data.type === 'transfer') {
      // Lógica para transferência entre locais
      if (data.fromLocationId && data.toLocationId && data.productId) {
        const fromLocation = await findByProductAndLocationName(data.productId, data.fromLocationId);
        
        if (!fromLocation || fromLocation.quantity < data.quantity) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Quantidade insuficiente no local de origem' });
        }

        let toLocation = await findByProductAndLocationName(data.productId, data.toLocationId);
        
        if (!toLocation) {
          toLocation = await StockLocation.create({
            productId: data.productId,
            location: data.toLocationId,
            quantity: 0
          }, { transaction });
        }

        // Atualizar quantidades
        await fromLocation.update({ quantity: fromLocation.quantity - data.quantity }, { transaction });
        await toLocation.update({ quantity: toLocation.quantity + data.quantity }, { transaction });
      }
    }

    // Criar o movimento
    const stockMovement = await StockMovement.create(data, { transaction });
    
    await transaction.commit();
    res.status(201).json(stockMovement);
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Error creating stock movement:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllStockMovements = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filterOptions = {
      searchFields: ['observation'],
      filterFields: ['type', 'status', 'category', 'productId', 'fromLocationId', 'toLocationId'],
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

    const { where, order, limit: queryLimit, offset, include } = buildAdvancedFilters(
      req.query, 
      filterOptions
    );

    const result = await StockMovement.findAndCountAll({
      where,
      include,
      order,
      limit: queryLimit,
      offset
    });

    const response = formatPaginatedResponse(result, page, limit, 'stockMovements');
    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Error fetching stock movements:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStockMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    const stockMovement = await StockMovement.findByPk(id);
    
    if (!stockMovement) {
      return res.status(404).json({ message: 'StockMovement not found' });
    }
    
    res.status(200).json(stockMovement);
  } catch (err) {
    console.error('❌ Error fetching stock movement:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const stockMovement = await StockMovement.findByPk(id);
    
    if (!stockMovement) {
      return res.status(404).json({ message: 'StockMovement not found' });
    }
    
    await stockMovement.update(req.body);
    res.status(200).json(stockMovement);
  } catch (err) {
    console.error('❌ Error updating stock movement:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const stockMovement = await StockMovement.findByPk(id);
    
    if (!stockMovement) {
      return res.status(404).json({ message: 'StockMovement not found' });
    }
    
    await stockMovement.destroy();
    res.status(200).json({ message: 'StockMovement deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting stock movement:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};