const BaseService = require('./base.service');
const Client = require('../models/Client');
const clientSchema = require('../validation/clientSchema');
const { Op } = require('sequelize');

class ClientService extends BaseService {
  constructor() {
    super(Client, clientSchema, []);
  }

  async findAllPaginated(query) {
    const { page = 1, limit = 10, search } = query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      [Op.or]: [
        { name: { [Op.ne]: '' } },
        { phone: { [Op.ne]: '' } },
        { cpf: { [Op.ne]: '' } }
      ]
    };
    
    if (search) {
      where[Op.and] = [{
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { cpf: { [Op.like]: `%${search}%` } }
        ]
      }];
    }
    
    return this.model.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['id', 'ASC']]
    });
  }

  async search(term) {
    const searchFields = ['name', 'cpf'];
    return super.search(term, searchFields, 10);
  }
}

module.exports = new ClientService();
