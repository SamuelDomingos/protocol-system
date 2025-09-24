const BaseService = require('./base.service');
const { Stage, Protocol } = require('../models');
const { Op } = require('sequelize');
const stageSchema = require('../validation/stage.schema');

class StageService extends BaseService {
  constructor() {
    const defaultIncludes = [
      {
        model: Protocol,
        as: 'protocol',
        attributes: ['id', 'title'],
        required: false
      }
    ];

    super(Stage, stageSchema, defaultIncludes);
  }

  async findByProtocolId(protocolId) {
    return this.model.findAll({
      where: { protocolId },
      order: [['order', 'ASC']]
    });
  }

  async create(data) {
    const { value } = this.validate(data);
    
    // Verificar se o protocolo existe
    await this.checkProtocolExists(value.protocolId);
    
    // Verificar se já existe um estágio com a mesma ordem para o protocolo
    await this.checkOrderUnique(value.protocolId, value.order);
    
    return super.create(value);
  }

  async update(id, data) {
    const { value } = this.validate(data);
    const stage = await this.checkExists(id);
    
    // Se estiver alterando o protocolo, verificar se o novo protocolo existe
    if (value.protocolId && value.protocolId !== stage.protocolId) {
      await this.checkProtocolExists(value.protocolId);
    }
    
    // Se estiver alterando a ordem, verificar se a nova ordem é única
    if (value.order && value.order !== stage.order) {
      await this.checkOrderUnique(value.protocolId || stage.protocolId, value.order);
    }
    
    return super.update(id, value);
  }

  async reorderStages(protocolId, stagesOrder) {
    // stagesOrder deve ser um array de objetos { id, order }
    await this.checkProtocolExists(protocolId);
    
    return this.transaction(async (t) => {
      const updatePromises = stagesOrder.map(item => 
        this.model.update(
          { order: item.order },
          { where: { id: item.id, protocolId }, transaction: t }
        )
      );
      
      await Promise.all(updatePromises);
      
      return this.findByProtocolId(protocolId);
    });
  }

  async checkProtocolExists(protocolId) {
    const protocol = await Protocol.findByPk(protocolId);
    if (!protocol) {
      throw new Error('Protocolo não encontrado');
    }
    return protocol;
  }

  async checkOrderUnique(protocolId, order) {
    const existingStage = await this.model.findOne({
      where: { protocolId, order }
    });
    
    if (existingStage) {
      throw new Error(`Já existe um estágio com a ordem ${order} para este protocolo`);
    }
  }
}

module.exports = new StageService();