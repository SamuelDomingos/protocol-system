const BaseService = require('../Base/base.service');
const Stage = require('../Stage/Stage');
const Protocol = require('../Protocol/Protocol');
const stageSchema = require('./stage.schema');

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
    await this.checkProtocolExists(value.protocolId);
    
    await this.checkOrderUnique(value.protocolId, value.order);
    
    return super.create(value);
  }

  async update(id, data) {
    const { value } = this.validate(data);
    const stage = await this.checkExists(id);

    if (value.protocolId && value.protocolId !== stage.protocolId) {
      await this.checkProtocolExists(value.protocolId);
    }
    
    if (value.order && value.order !== stage.order) {
      await this.checkOrderUnique(value.protocolId || stage.protocolId, value.order);
    }
    
    return super.update(id, value);
  }

  async reorderStages(protocolId, stagesOrder) {
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