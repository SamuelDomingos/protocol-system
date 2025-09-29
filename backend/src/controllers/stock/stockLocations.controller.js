const stockLocationsService = require('../../services/stock/stockLocations.service');

exports.createStockLocation = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      return res.status(400).json({ message: 'O corpo da requisição deve ser um objeto, não um array.' });
    }

    const stockLocation = await stockLocationsService.create(req.body);
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
    const result = await stockLocationsService.findAllPaginated(req.query);
    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Error fetching stock locations:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStockLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const stockLocation = await stockLocationsService.findById(id);
    res.status(200).json(stockLocation);
  } catch (err) {
    console.error('❌ Error fetching stock location:', err);
    if (err.status === 404) {
      return res.status(404).json({ message: 'StockLocation not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateStockLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const stockLocation = await stockLocationsService.update(id, req.body);
    res.status(200).json(stockLocation);
  } catch (err) {
    console.error('❌ Error updating stock location:', err);
    if (err.status === 404) {
      return res.status(404).json({ message: 'StockLocation not found' });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Já existe um registro para este produto nesta localização.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteStockLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await stockLocationsService.delete(id);
    res.status(200).json({ message: 'StockLocation deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting stock location:', err);
    if (err.status === 404) {
      return res.status(404).json({ message: 'StockLocation not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Manter esta função para compatibilidade com o controller de movimentações
exports.findByProductAndLocationName = async (productId, locationName) => {
  return await stockLocationsService.findByProductAndLocationName(productId, locationName);
};
