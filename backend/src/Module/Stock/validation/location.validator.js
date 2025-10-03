const { Supplier, Client, User } = require('../../Index');

class LocationValidator {
  async validate(movementData, transaction) {
    const { fromLocationId, fromLocationType, toLocationId, toLocationType } = movementData;

    if (fromLocationId && fromLocationType)
      await this.exists(fromLocationId, fromLocationType, transaction);
    
    if (toLocationId && toLocationType)
      await this.exists(toLocationId, toLocationType, transaction);
  }

  async exists(locationId, locationType, transaction) {
    const models = { supplier: Supplier, user: User, client: Client };
    const model = models[locationType];

    if (!model) throw new Error(`Tipo de localização inválido: ${locationType}`);

    const location = await model.findByPk(locationId, { transaction });
    if (!location) throw new Error(`${locationType} com ID ${locationId} não foi encontrado`);
  }
}

module.exports = LocationValidator;
