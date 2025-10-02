const BaseService = require('./base.service');
const Kit = require('../models/Kit');
const KitProduct = require('../models/KitProduct');
const Product = require('../models/Product');
const kitSchema = require('../validation/kitSchema');
const { Op } = require('sequelize');

class KitService extends BaseService {
  constructor() {
    super(Kit, kitSchema, [
      {
        model: Product,
        as: 'products',
        through: { attributes: ['quantity'] }
      }
    ]);
  }

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: ['name', 'category'],
      filterFields: ['status', 'category'],
      includes: this.defaultIncludes,
      defaultSort: [['createdAt', 'DESC']]
    };

    return super.findAllPaginated(query, filterOptions);
  }

  async search(term) {
    const searchFields = ['name', 'category'];
    return super.search(term, searchFields, 10);
  }

  async createWithProducts(data) {
    const { value } = this.validate(data);
    const { products = [], ...kitData } = value;

    return this.transaction(async (t) => {
      const kit = await this.model.create(kitData, { transaction: t });

      if (products && products.length > 0) {
        const kitProducts = products.map(p => ({
          kitId: kit.id,
          productId: p.productId,
          quantity: p.quantity
        }));

        await KitProduct.bulkCreate(kitProducts, { transaction: t });
      }

      return this.findById(kit.id);
    });
  }

  async updateWithProducts(id, data) {
    const { value } = this.validate(data);
    const { products = [], ...kitData } = value;

    return this.transaction(async (t) => {
      const kit = await this.checkExists(id);
      await kit.update(kitData, { transaction: t });

      await KitProduct.destroy({ where: { kitId: id }, transaction: t });

      if (products && products.length > 0) {
        const kitProducts = products.map(p => ({
          kitId: id,
          productId: p.productId,
          quantity: p.quantity
        }));

        await KitProduct.bulkCreate(kitProducts, { transaction: t });
      }

      return this.findById(id);
    });
  }
}

module.exports = new KitService();
