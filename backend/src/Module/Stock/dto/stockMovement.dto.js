const { Supplier, Client, User } = require('../../Index');

class StockMovementDTO {
  async toListItem(movement) {
    const data = movement.toJSON();

    const fromLocation = await this.getLocation(data.fromLocationId, data.fromLocationType);
    const toLocation = await this.getLocation(data.toLocationId, data.toLocationType);

    return {
      id: data.id,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      createdAt: data.createdAt,
      fromLocation,
      toLocation,
      product: data.product,
      user: data.user
    };
  }

  async getLocation(id, type) {
    if (!id || !type) return null;
    const models = { supplier: Supplier, client: Client, user: User };
    const model = models[type];
    const location = model ? await model.findByPk(id) : null;
    return location ? { id: location.id, name: location.name } : null;
  }
}

module.exports = StockMovementDTO;
