const BaseService = require("../../../Base/base.service");
const { StockMovement } = require("../../models/StockMovement");
const { stockMovementSchema } = require("../../validation/stockMovementSchema");
const StockMovementDTO = require("../../dto/stockMovement.dto");
const LocationValidator = require("../../validation/location.validator");
const StockProcessor = require("../atoms/StockProcessor");
const MovementSearch = require("../atoms/MovementSearch");
const MovementPaginated = require("../atoms/MovementPaginated");
const { User } = require("../../../Index");
class StockMovementsService extends BaseService {
  constructor() {
    super(StockMovement, stockMovementSchema, []);

    this.locationValidator = new LocationValidator();
    this.stockProcessor = new StockProcessor();
    this.dto = new StockMovementDTO();
    this.searchService = new MovementSearch();
    this.paginatedService = new MovementPaginated(StockMovement, this.dto);
  }

  async createMovement(movementData) {
    const { value } = this.validate(movementData);
    return this.transaction(async (transaction) => {
      await this.locationValidator.validate(value, transaction);
      const movement = await this.model.create(value, { transaction });
      await this.stockProcessor.process(value, transaction);
      return movement;
    });
  }

  async findById(id) {
    const movement = await super.findById(id, [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
    ]);

    if (!movement) return null;

    return this.dto.toListItem(movement);
  }

  async findAllPaginated(query) {
    return this.paginatedService.paginate(query);
  }

  async search(term) {
    return this.searchService.search(term);
  }

  async findByProduct(productId, options = {}) {
    return this.paginatedService.findByProduct(productId, options);
  }
}

module.exports = new StockMovementsService();
