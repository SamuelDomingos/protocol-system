const StockLocation = require('../../models/StockLocation');

class StockProcessor {
  async process(movementData, transaction) {
    switch (movementData.type) {
      case 'entrada':
        return this.processEntrada(movementData, transaction);
      case 'saida':
        return this.processSaida(movementData, transaction);
      case 'transferencia':
        return this.processTransferencia(movementData, transaction);
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

    await toLocation.update({
      quantity: toLocation.quantity + quantity
    }, { transaction });
  }
}

module.exports = StockProcessor;
