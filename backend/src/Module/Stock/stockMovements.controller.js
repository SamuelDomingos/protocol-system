const BaseController = require('../Base/base.controller');
const stockMovementsService = require('./stockMovements.service');
const asyncHandler = require('../../utils/asyncHandler');

class StockMovementsController extends BaseController {
  constructor() {
    super(stockMovementsService, 'data');
  }

  create = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "Usuário não autenticado." });
    }

    const data = { ...req.body, userId };
    const stockMovement = await this.service.createMovement(data);
    res.status(201).json(stockMovement);
  });

  getByProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const result = await this.service.findByProduct(productId, req.query);
    res.json(result);
  });

  getMovementTypes = asyncHandler(async (req, res) => {
    const types = ['entrada', 'saida', 'transferencia'];
    res.json(types);
  });
}

const stockMovementsController = new StockMovementsController();

module.exports = {
  createStockMovement: stockMovementsController.create,
  getAllStockMovements: stockMovementsController.getAll,
  getStockMovementById: stockMovementsController.getById,
  updateStockMovement: stockMovementsController.update,
  deleteStockMovement: stockMovementsController.delete,
  getByProduct: stockMovementsController.getByProduct,
  getStockMovementTypes: stockMovementsController.getMovementTypes
};
