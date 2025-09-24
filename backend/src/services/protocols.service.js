const BaseService = require('./base.service');
const { Protocol, Stage, Client } = require('../models');
const { Op, Sequelize } = require('sequelize');
const protocolSchema = require('../validation/protocol.schema');

class ProtocolService extends BaseService {
  constructor() {
    // Configuração básica sem includes desnecessários
    super(Protocol, protocolSchema, []);
  }

  // Método auxiliar para preparar stages com ordem
  _prepareStagesWithOrder(stages, protocolId) {
    return stages.map((stage, index) => ({
      ...stage,
      order: index + 1,
      protocolId
    }));
  }

  // Método para obter configuração de consulta padrão
  _getQueryConfig(includeClient = true) {
    const config = {
      attributes: {
        include: [
          [Sequelize.literal('(SELECT COUNT(*) FROM Stages WHERE Stages.protocolId = Protocol.id)'), 'stage']
        ]
      },
      include: []
    };

    if (includeClient) {
      config.include.push({
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'cpf', 'phone'],
        required: false
      });
    }

    return config;
  }

  // Método para processar resultados e remover campos indesejados em templates
  _processResults(results) {
    if (!results) return results;
    
    // Se for um único objeto
    if (!Array.isArray(results)) {
      if (results.isTemplate) {
        const plainResult = results.get ? results.get({ plain: true }) : results;
        const { isTemplate, clientId, client, id, ...templateData } = plainResult;
        return {
          ...templateData,
          title: plainResult.title
        };
      }
      return results;
    }
    
    // Se for um array
    return results.map(item => {
      const plainItem = item.get ? item.get({ plain: true }) : item;
      
      if (plainItem.isTemplate) {
        const { isTemplate, clientId, client, id, ...templateData } = plainItem;
        return {
          ...templateData,
          title: plainItem.title
        };
      }
      
      return plainItem;
    });
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

      await Stage.destroy({ where: { protocolId: protocol.id }, transaction: t });

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
      includes: [],
      defaultSort: [['createdAt', 'DESC']]
    };

    // Usar queryBuilder para construir a consulta
    const queryConfig = require('../utils/queryBuilder').buildAdvancedFilters(query, filterOptions);
    const { where, order, limit, offset } = queryConfig;
    
    // Adicionar configuração de consulta padrão
    const config = this._getQueryConfig(true);
    
    // Se houver pesquisa por cliente
    if (query.search) {
      config.include.push({
        model: Client,
        as: 'client',
        required: false,
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query.search}%` } },
            { cpf: { [Op.like]: `%${query.search}%` } }
          ]
        }
      });
    }

    const result = await this.model.findAndCountAll({
      ...config,
      where,
      order,
      limit,
      offset
    });

    if (result && result.rows) {
      result.rows = this._processResults(result.rows);
    }

    return result;
  }

  async findById(id) {
    const config = this._getQueryConfig(true);
    const protocol = await this.model.findByPk(id, config);
    
    if (!protocol) {
      throw new Error('Protocolo não encontrado');
    }
    
    return this._processResults(protocol);
  }

  async search(term) {
    if (!term || term.trim() === '') return [];

    const config = this._getQueryConfig(true);
    
    // Adicionar condições de pesquisa
    const protocols = await this.model.findAll({
      ...config,
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${term}%` } }
        ]
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cpf'],
          required: false,
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${term}%` } },
              { cpf: { [Op.like]: `%${term}%` } }
            ]
          }
        }
      ],
      limit: 10,
      order: [['title', 'ASC']]
    });

    return this._processResults(protocols);
  }

  async validateClient(clientId, isTemplate) {
    if (isTemplate) return true;
    const client = await Client.findByPk(clientId);
    return !!client;
  }
}

module.exports = new ProtocolService();