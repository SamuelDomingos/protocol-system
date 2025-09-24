const BaseService = require('./base.service');
const { Protocol, Stage, Client, User } = require('../models');
const { Op, Sequelize } = require('sequelize');
const protocolSchema = require('../validation/protocol.schema');

class ProtocolService extends BaseService {
  constructor() {
    const defaultIncludes = [
      {
        model: Stage,
        as: 'stages',
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('stages.id')), 'stageCount']],
        required: false
      },
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'cpf'],
        required: false
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }
    ];

    super(Protocol, protocolSchema, defaultIncludes);
  }

  _prepareStagesWithOrder(stages, protocolId) {
    return stages.map((stage, index) => ({
      ...stage,
      order: index + 1,
      protocolId
    }));
  }

  _getDetailedIncludes() {
    return [
      {
        model: Stage,
        as: 'stages',
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('stages.id')), 'stageCount']],
        required: false
      },
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'cpf', 'phone', 'observation']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'role']
      }
    ];
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
      includes: this.defaultIncludes,
      defaultSort: [['createdAt', 'DESC']]
    };

    const result = await super.findAllPaginated(query, filterOptions);

    // Processar os resultados para remover campos indesejados em templates
    if (result && result.rows) {
      result.rows = result.rows.map(protocol => {
        const plainProtocol = protocol.get({ plain: true });
        
        // Se for um template, remover campos específicos
        if (plainProtocol.isTemplate) {
          const { isTemplate, clientId, client, id, creator, creatorDy, ...templateData } = plainProtocol;
          return {
            ...templateData,
            title: plainProtocol.title
          };
        }
        
        return plainProtocol;
      });
    }

    if (query.search) {
      const { where, order, limit, offset } = require('../utils/queryBuilder').buildAdvancedFilters(query, filterOptions);
      
      const customIncludes = [...this.defaultIncludes];
      const clientInclude = customIncludes.find(inc => inc.model === Client);
      
      if (clientInclude) {
        clientInclude.where = {
          [Op.or]: [
            { name: { [Op.like]: `%${query.search}%` } },
            { cpf: { [Op.like]: `%${query.search}%` } }
          ]
        };
        clientInclude.as = 'client';
      }

      const searchResult = await this.model.findAndCountAll({
        where,
        include: customIncludes,
        order,
        limit,
        offset
      });

      // Processar os resultados para remover campos indesejados em templates
      if (searchResult && searchResult.rows) {
        searchResult.rows = searchResult.rows.map(protocol => {
          const plainProtocol = protocol.get({ plain: true });
          
          // Se for um template, remover campos específicos
          if (plainProtocol.isTemplate) {
            const { isTemplate, clientId, client, id, ...templateData } = plainProtocol;
            return {
              ...templateData,
              title: plainProtocol.title
            };
          }
          
          return plainProtocol;
        });
      }

      return searchResult;
    }

    return result;
  }

  async findById(id, includes = null) {
    const protocol = await super.findById(id, includes || this._getDetailedIncludes());
    
    if (protocol && protocol.isTemplate) {
      const plainProtocol = protocol.get({ plain: true });
      const { isTemplate, clientId, client, id, ...templateData } = plainProtocol;
      return {
        ...templateData,
        title: plainProtocol.title
      };
    }
    
    return protocol;
  }

  async search(term) {
    if (!term || term.trim() === '') return [];

    const protocols = await this.model.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${term}%` } }
        ]
      },
      include: [
        {
          model: Stage,
          as: 'stages',
          attributes: [[Sequelize.fn('COUNT', Sequelize.col('stages.id')), 'stageCount']],
          required: false
        },
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
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      limit: 10,
      order: [['title', 'ASC']]
    });

    // Processar os resultados para remover campos indesejados em templates
    return protocols.map(protocol => {
      const plainProtocol = protocol.get({ plain: true });
      
      // Se for um template, remover campos específicos
      if (plainProtocol.isTemplate) {
        const { isTemplate, clientId, client, id, ...templateData } = plainProtocol;
        return {
          ...templateData,
          title: plainProtocol.title
        };
      }
      
      return plainProtocol;
    });
  }

  async validateClient(clientId, isTemplate) {
    if (isTemplate) return true;
    const client = await Client.findByPk(clientId);
    return !!client;
  }
}

module.exports = new ProtocolService();