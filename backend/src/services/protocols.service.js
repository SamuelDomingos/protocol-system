const BaseService = require('./base.service');
const { Protocol, Stage, Client } = require('../models');
const { Op, Sequelize } = require('sequelize');
const protocolSchema = require('../validation/protocol.schema');

class ProtocolService extends BaseService {
  constructor() {
    super(Protocol, protocolSchema, []);
  }

  _prepareStagesWithOrder(stages, protocolId) {
    return stages.map((stage, index) => ({
      ...stage,
      order: index + 1,
      protocolId
    }));
  }

  _getBaseQueryConfig(includeStagesData = false) {
    const config = {
      attributes: {
        include: [
          [Sequelize.literal(`(SELECT SUM(value) FROM Stages WHERE Stages.protocolId = Protocol.id)`), 'totalValue']
        ]
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cpf'],
          required: false
        },
        {
          model: Stage,
          as: 'stages',
          attributes: includeStagesData ? ['id', 'name', 'value', 'intervalDays', 'order'] : ['id'],
          required: false,
          order: includeStagesData ? [['order', 'ASC']] : undefined
        }
      ]
    };

    return config;
  }

  _processResults(results) {
    if (!results) return results;

    const processSingle = (item) => {
      const plain = item.get ? item.get({ plain: true }) : item;
      const { client, stages, ...data } = plain;
      
      const processedData = {
        ...data,
        totalValue: parseFloat(plain.totalValue) || 0,
        stage: stages ? stages.length : 0
      };

      // Para templates, remove clientId e clientName
      if (data.isTemplate) {
        const { clientId, ...templateData } = processedData;
        return templateData;
      }
      
      // Para protocolos normais, adiciona clientName
      return {
        ...processedData,
        clientName: client?.name || null
      };
    };

    return Array.isArray(results) ? results.map(processSingle) : processSingle(results);
  }

  async create(data, additionalData = {}) {
    const { value } = this.validate(data);
    const { clientId, title, stages, isTemplate } = value;
    const { createdBy } = additionalData;

    return this.transaction(async (t) => {
      const protocol = await this.model.create({
        title,
        clientId: isTemplate ? null : clientId,
        createdBy,
        isTemplate
      }, { transaction: t });

      const stagesWithOrder = this._prepareStagesWithOrder(stages, protocol.id);
      const createdStages = await Stage.bulkCreate(stagesWithOrder, { transaction: t });

      return { protocol, stages: createdStages };
    });
  }

  async update(id, data) {
    const { value } = this.validate(data);
    const { clientId, title, stages, isTemplate } = value;
    const protocol = await this.checkExists(id);

    await this.transaction(async (t) => {
      await protocol.update({ 
        clientId: isTemplate ? null : clientId, 
        title, 
        isTemplate 
      }, { transaction: t });

      await Stage.destroy({ where: { protocolId: id }, transaction: t });
      const stagesWithOrder = this._prepareStagesWithOrder(stages, protocol.id);
      await Stage.bulkCreate(stagesWithOrder, { transaction: t });
    });

    return this.findById(id);
  }

  async delete(id) {
    const protocol = await this.checkExists(id);

    await this.transaction(async (t) => {
      await Stage.destroy({ where: { protocolId: id }, transaction: t });
      await protocol.destroy({ transaction: t });
    });

    return true;
  }

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: ['title'],
      filterFields: ['status', 'isTemplate', 'createdBy', 'clientId'],
      defaultSort: [['createdAt', 'DESC']]
    };

    const { where, order, limit, offset } = require('../utils/queryBuilder')
      .buildAdvancedFilters(query, filterOptions);
    
    const config = this._getBaseQueryConfig();

    // Adiciona busca por cliente se necessário
    if (query.search) {
      const clientInclude = config.include.find(inc => inc.as === 'client');
      clientInclude.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${query.search}%` } },
          { cpf: { [Op.like]: `%${query.search}%` } }
        ]
      };
    }

    const result = await this.model.findAndCountAll({
      ...config,
      where,
      order,
      limit,
      offset
    });

    if (result?.rows) {
      result.rows = this._processResults(result.rows);
    }

    return result;
  }

  async findById(id) {
    const protocol = await this.model.findByPk(id, this._getBaseQueryConfig(true));
    
    if (!protocol) {
      throw new Error('Protocolo não encontrado');
    }

    return protocol.get({ plain: true });
  }

  async search(term) {
    if (!term?.trim()) return [];

    const protocols = await this.model.findAll({
      ...this._getBaseQueryConfig(),
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${term}%` } },
          { '$client.name$': { [Op.like]: `%${term}%` } },
          { '$client.cpf$': { [Op.like]: `%${term}%` } }
        ]
      },
      limit: 10,
      order: [['title', 'ASC']]
    });

    return this._processResults(protocols);
  }
}

module.exports = new ProtocolService();