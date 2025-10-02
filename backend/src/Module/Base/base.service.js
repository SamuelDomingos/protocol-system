const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const { buildAdvancedFilters } = require('../../utils/queryBuilder');

class BaseService {
  constructor(model, schema = null, includes = []) {
    this.model = model;
    this.schema = schema;
    this.defaultIncludes = includes;
  }

  validate(data) {
    if (!this.schema) return { error: null, value: data };
    
    const { error, value } = this.schema.validate(data);
    if (error) {
      throw { status: 400, message: error.details[0].message };
    }
    return { error: null, value };
  }

  async checkExists(id, errorMessage = 'Record not found') {
    const record = await this.model.findByPk(id);
    if (!record) {
      throw { status: 404, message: errorMessage };
    }
    return record;
  }

  async create(data, additionalData = {}) {
    const { value } = this.validate(data);
    return this.model.create({ ...value, ...additionalData });
  }

  async findById(id, includes = null) {
    const record = await this.model.findByPk(id, {
      include: includes || this.defaultIncludes
    });
    
    if (!record) {
      throw { status: 404, message: 'Record not found' };
    }
    
    return record;
  }

  async update(id, data) {
    const { value } = this.validate(data);
    const record = await this.checkExists(id);
    
    return record.update(value);
  }

  async delete(id) {
    const record = await this.checkExists(id);
    await record.destroy();
    return true;
  }

  async findAllPaginated(query, filterOptions = {}) {
    const defaultOptions = {
      searchFields: [],
      filterFields: [],
      includes: this.defaultIncludes,
      defaultSort: [['createdAt', 'DESC']]
    };

    const options = { ...defaultOptions, ...filterOptions };
    const { where, order, limit, offset, include } = buildAdvancedFilters(query, options);

    return this.model.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset
    });
  }

  async search(term, searchFields = [], limit = 10) {
    if (!term || term.trim() === '') return [];

    const where = {
      [Op.or]: searchFields.map(field => ({
        [field]: { [Op.like]: `%${term}%` }
      }))
    };

    return this.model.findAll({
      where,
      include: this.defaultIncludes,
      limit,
      order: [['createdAt', 'DESC']]
    });
  }

  async transaction(callback) {
    return sequelize.transaction(callback);
  }
}

module.exports = BaseService;