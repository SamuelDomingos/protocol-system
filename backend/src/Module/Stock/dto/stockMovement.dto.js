const { Supplier, Client, User, Product } = require("../../Index");
const StockLocation = require("../models/StockLocation"); // ajusta o caminho

class StockMovementDTO {
  async toListItem(movement) {
    const data = movement.toJSON();

    const fromLocation = await this.getLocationWithStock(
      data.fromLocationId,
      data.fromLocationType,
      data.productId
    );
    const toLocation = await this.getLocationWithStock(
      data.toLocationId,
      data.toLocationType,
      data.productId
    );
    const product = await this.getProduct(data.productId);

    return {
      id: data.id,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      createdAt: data.createdAt,
      fromLocation,
      toLocation,
      product,
      user: data.user,
    };
  }

  async getLocation(id, type) {
    if (!id || !type) return null;
    const models = { supplier: Supplier, client: Client, user: User };
    const model = models[type];
    const location = model ? await model.findByPk(id) : null;
    return location ? { id: location.id, name: location.name } : null;
  }

  async getLocationWithStock(locationId, type, productId) {
    if (!locationId || !type || !productId) return null;

    const location = await this.getLocation(locationId, type);
    if (!location) return null;

    const stock = await StockLocation.findOne({
      where: { location: locationId, productId },
      attributes: ['sku', 'expiryDate']
    });

    return {
      ...location,
      sku: stock?.sku || null,
      expiryDate: stock?.expiryDate || null
    };
  }

  async getProduct(id) {
    if (!id) return null;
    const product = await Product.findByPk(id, { attributes: ["id", "name"] });
    return product ? { id: product.id, name: product.name } : null;
  }
}

module.exports = StockMovementDTO;
