const stockMovementsService = require("../../services/stock/stockMovements.service");

exports.createStockMovement = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "Usuário não autenticado." });
    }

    const data = { ...req.body, userId };
    const stockMovement = await stockMovementsService.createMovement(data);

    res.status(201).json(stockMovement);
  } catch (err) {
    console.error("❌ Error creating stock movement:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};

exports.getAllStockMovements = async (req, res) => {
  try {
    const result = await stockMovementsService.findAllPaginated(req.query);
    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error fetching stock movements:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getStockMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    const stockMovement = await stockMovementsService.findById(id);
    res.status(200).json(stockMovement);
  } catch (err) {
    console.error("❌ Error fetching stock movement:", err);
    if (err.status === 404) {
      return res.status(404).json({ message: "StockMovement not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const stockMovement = await stockMovementsService.update(id, req.body);
    res.status(200).json(stockMovement);
  } catch (err) {
    console.error("❌ Error updating stock movement:", err);
    if (err.status === 404) {
      return res.status(404).json({ message: "StockMovement not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    await stockMovementsService.delete(id);
    res.status(200).json({ message: "StockMovement deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting stock movement:", err);
    if (err.status === 404) {
      return res.status(404).json({ message: "StockMovement not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
