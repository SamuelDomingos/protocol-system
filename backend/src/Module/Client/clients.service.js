const BaseService = require('../Base/base.service');
const Client = require('../Client/Client');
const clientSchema = require('../Client/clientSchema');
const { Op } = require('sequelize');

class ClientService extends BaseService {
  constructor() {
    super(Client, clientSchema, []);
  }

  async create(data, additionalData = {}) {
    const { value } = this.validate(data);

    const cpfValue = typeof value.cpf === 'string' ? value.cpf.trim() : value.cpf;
    if (cpfValue) {
      const existing = await this.model.findOne({ where: { cpf: cpfValue } });
      if (existing) {
        throw { status: 409, message: 'CPF já cadastrado' };
      }
    }

    return this.model.create({ ...value, ...additionalData });
  }

  async update(id, data) {
    const { value } = this.validate(data);
    const record = await this.checkExists(id, 'Cliente não encontrado');

    const cpfValue = typeof value.cpf === 'string' ? value.cpf.trim() : value.cpf;
    if (cpfValue) {
      const existing = await this.model.findOne({
        where: {
          cpf: cpfValue,
          id: { [Op.ne]: id }
        }
      });
      if (existing) {
        throw { status: 409, message: 'CPF já cadastrado' };
      }
    }

    return record.update(value);
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
