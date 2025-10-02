const BaseService = require('../../Module/Base/base.service');
const Supplier = require('./Supplier');
const supplierSchema = require('./supplierSchema');
const { Op } = require('sequelize');

class SuppliersService extends BaseService {
  constructor() {
    super(Supplier, supplierSchema);
  }

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: ['name', 'category', 'notes'],
      filterFields: ['type', 'category'],
      includes: [],
      defaultSort: [['name', 'ASC']]
    };

    return await super.findAllPaginated(query, filterOptions);
  }

  async findByType(type) {
    return await this.model.findAll({
      where: { type },
      order: [['name', 'ASC']]
    });
  }

  async findByCategory(category) {
    return await this.model.findAll({
      where: { category: { [Op.like]: `%${category}%` } },
      order: [['name', 'ASC']]
    });
  }

  async getSuppliers() {
    return await this.findByType('supplier');
  }

  async getUnits() {
    return await this.findByType('unit');
  }

  async getCategories() {
    const categories = await this.model.findAll({
      attributes: ['category'],
      where: { category: { [Op.ne]: null } },
      group: ['category'],
      order: [['category', 'ASC']]
    });
    return categories.map(item => item.category).filter(Boolean);
  }

  async search(term) {
    if (!term?.trim()) return [];

    const suppliers = await this.model.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${term}%` } },
          { category: { [Op.like]: `%${term}%` } },
          { notes: { [Op.like]: `%${term}%` } }
        ]
      },
      limit: 10,
      order: [['name', 'ASC']]
    });

    return suppliers;
  }
}

module.exports = new SuppliersService();