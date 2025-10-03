const { User } = require('../../../Index');

class MovementPaginated {
  constructor(model, dto) {
    this.model = model;
    this.dto = dto;
  }

  async paginate(query) {
    if (query.search) {
      return await this.searchMovements(query);
    }

    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }]
    });

    const processedRows = await Promise.all(rows.map(this.dto.toListItem.bind(this.dto)));
    return { count, rows: processedRows };
  }

    async findByProduct(productId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where: { productId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }]
    });

    const processedMovements = await Promise.all(
      rows.map(async (movement) => {
        const data = movement.toJSON();

        let fromLocation = null;
        if (data.fromLocationId && data.fromLocationType) {
          fromLocation = await this.dto.getLocation(data.fromLocationId, data.fromLocationType);
        }

        let toLocation = null;
        if (data.toLocationId && data.toLocationType) {
          toLocation = await this.dto.getLocation(data.toLocationId, data.toLocationType);
        }

        return {
          id: data.id,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes,
          totalValue: data.totalValue,
          unitPrice: data.unitPrice,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          fromLocation: fromLocation,
          toLocation: toLocation,
          product: data.product,
          user: data.user
        };
      })
    );

    return {
      movements: processedMovements,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    };
  }
}

module.exports = MovementPaginated;