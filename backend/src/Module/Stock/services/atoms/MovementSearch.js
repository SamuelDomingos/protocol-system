const { Supplier, Client, User } = require('../../../Index/index');

class MovementSearch {

  async search(term) {
    if (!term?.trim()) return [];

    const { Op } = require('sequelize');

    const [suppliers, users, clients] = await Promise.all([
      Supplier.findAll({
        where: { name: { [Op.like]: `%${term}%` } },
        attributes: ['id']
      }),
      User.findAll({
        where: { name: { [Op.like]: `%${term}%` } },
        attributes: ['id']
      }),
      Client.findAll({
        where: { name: { [Op.like]: `%${term}%` } },
        attributes: ['id']
      })
    ]);

    const supplierIds = suppliers.map(s => s.id);
    const userIds = users.map(u => u.id);
    const clientIds = clients.map(c => c.id);

    const searchConditions = [
      { type: { [Op.like]: `%${term}%` } },
      { reason: { [Op.like]: `%${term}%` } },
      { notes: { [Op.like]: `%${term}%` } },

      ...(userIds.length > 0 ? [{ userId: { [Op.in]: userIds } }] : []),
      
      ...(supplierIds.length > 0 ? [{ 
        fromLocationId: { [Op.in]: supplierIds },
        fromLocationType: 'supplier'
      }] : []),
      ...(userIds.length > 0 ? [{ 
        fromLocationId: { [Op.in]: userIds },
        fromLocationType: 'user'
      }] : []),
      ...(clientIds.length > 0 ? [{ 
        fromLocationId: { [Op.in]: clientIds },
        fromLocationType: 'client'
      }] : []),

      ...(supplierIds.length > 0 ? [{ 
        toLocationId: { [Op.in]: supplierIds },
        toLocationType: 'supplier'
      }] : []),
      ...(userIds.length > 0 ? [{ 
        toLocationId: { [Op.in]: userIds },
        toLocationType: 'user'
      }] : []),
      ...(clientIds.length > 0 ? [{ 
        toLocationId: { [Op.in]: clientIds },
        toLocationType: 'client'
      }] : [])
    ];

    const movements = await this.model.findAll({
      where: {
        [Op.or]: searchConditions
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'unit'],
          where: {
            name: { [Op.like]: `%${term}%` }
          },
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          where: {
            name: { [Op.like]: `%${term}%` }
          },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const simplifiedRows = await Promise.all(
      movements.map(async (movement) => {
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
          createdAt: data.createdAt,
          fromLocation: fromLocation,
          toLocation: toLocation,
          product: data.product,
          user: data.user
        };
      })
    );

    return simplifiedRows;
  }
}

module.exports = MovementSearch;