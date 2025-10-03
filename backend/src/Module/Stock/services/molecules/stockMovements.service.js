
const BaseService = require('../../Base/base.service');
const { StockMovement } = require('../models/StockMovement');
const { Product, Supplier, User, Client } = require('../../Index');
const { stockMovementSchema } = require('../validation/stockMovementSchema');
const { StockMovementDTO } = require('../dto/stockMovement.dto');
const LocationValidator = require('../validators/LocationValidator');
const StockProcessor = require('../atoms/StockProcessor');
const searchService = require('../atoms/MovementSearch');
const paginatedService = require('../atoms/MovementPaginated');

class StockMovementsService extends BaseService {
  constructor() {
    super(StockMovement, stockMovementSchema, [...]);

    this.locationValidator = new LocationValidator();
    this.stockProcessor = new StockProcessor();
    this.dto = new StockMovementDTO();
    this.searchService = new MovementSearchService();
    this.paginatedService = new MovementPaginatedService();
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