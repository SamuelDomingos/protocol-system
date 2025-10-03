class MovementPaginated {
  async findAllPaginated(query) {
    if (query.search) {
      return await this.searchMovements(query);
    }

    const result = await super.findAllPaginated(query, { ... });
    const rows = await Promise.all(result.rows.map(this.dto.toListItem));
    return { count: result.count, rows };
  }

    async findByProduct(productId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where: { productId },
      include: this.defaultIncludes,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const processedMovements = await Promise.all(
      rows.map(async (movement) => {
        const data = movement.toJSON();

        let fromLocation = null;
        if (data.fromLocationId && data.fromLocationType) {
          const location = await this.getLocationByTypeAndId(data.fromLocationId, data.fromLocationType);
          fromLocation = location ? { id: location.id, name: location.name } : null;
        }

        let toLocation = null;
        if (data.toLocationId && data.toLocationType) {
          const location = await this.getLocationByTypeAndId(data.toLocationId, data.toLocationType);
          toLocation = location ? { id: location.id, name: location.name } : null;
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