const StockLocation = require('../models/StockLocation');
const { buildAdvancedFilters, formatPaginatedResponse } = require('../utils/queryBuilder');
const { Op } = require('sequelize');

exports.createStockLocation = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      return res.status(400).json({ message: 'O corpo da requisição deve ser um objeto, não um array.' });
    }

    const stockLocation = await StockLocation.create(req.body);
    console.log('StockLocation criada/salva:', stockLocation.id, stockLocation.location);
    res.status(201).json(stockLocation);
  } catch (err) {
    console.error('❌ Error creating stock location:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Já existe um registro para este produto nesta localização.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllStockLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filterOptions = {
      searchFields: ['location', 'sku'],
      filterFields: ['productId', 'location'],
      includes: [],
      defaultSort: [['createdAt', 'DESC']]
    };

    const { where, order, limit: queryLimit, offset, include } = buildAdvancedFilters(
      req.query, 
      filterOptions
    );

    const result = await StockLocation.findAndCountAll({
      where,
      include,
      order,
      limit: queryLimit,
      offset
    });

    const response = formatPaginatedResponse(result, page, limit, 'stockLocations');
    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Error fetching stock locations:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStockLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const stockLocation = await StockLocation.findByPk(id);
    
    if (!stockLocation) {
      return res.status(404).json({ message: 'StockLocation not found' });
    }
    
    res.status(200).json(stockLocation);
  } catch (err) {
    console.error('❌ Error fetching stock location:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateStockLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const stockLocation = await StockLocation.findByPk(id);
    
    if (!stockLocation) {
      return res.status(404).json({ message: 'StockLocation not found' });
    }
    
    await stockLocation.update(req.body);
    res.status(200).json(stockLocation);
  } catch (err) {
    console.error('❌ Error updating stock location:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Já existe um registro para este produto nesta localização.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteStockLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const stockLocation = await StockLocation.findByPk(id);
    
    if (!stockLocation) {
      return res.status(404).json({ message: 'StockLocation not found' });
    }
    
    await stockLocation.destroy();
    res.status(200).json({ message: 'StockLocation deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting stock location:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.findByProductAndLocationName = async (productId, locationName) => {
  try {
    return await StockLocation.findOne({
      where: {
        productId: productId,
        location: locationName
      }
    });
  } catch (err) {
    console.error('❌ Error finding stock location by product and location:', err);
    return null;
  }
};
