const BaseService = require('./base.service');
const { Application, Stage, User, Protocol } = require('../models');
const applicationSchema = require('../validation/applicationSchema');

class ApplicationService extends BaseService {
  constructor() {
    const defaultIncludes = [
      {
        model: User,
        as: 'nurse',
        attributes: ['id', 'name', 'role']
      },
      {
        model: Stage,
        as: 'stage',
        attributes: ['id', 'name', 'order', 'protocolId'],
        include: [{
          model: Protocol,
          as: 'protocol',
          attributes: ['id', 'title']
        }]
      }
    ];

    super(Application, applicationSchema, defaultIncludes);
  }

  async findByStage(stageId) {
    return this.model.findAll({
      where: { stageId },
      include: this.defaultIncludes
    });
  }

  async complete(id, userId) {
    const application = await this.checkExists(id, 'Application not found');
    
    return application.update({
      status: 'completed',
      completedAt: new Date(),
      completedBy: userId
    });
  }

  async createWithFile(data, fileBuffer, userId) {
    const validatedData = this.validate(data);
    
    const stage = await Stage.findByPk(validatedData.value.stageId);
    if (!stage) {
      throw { status: 400, message: 'Stage not found' };
    }

    const applicationData = {
      ...validatedData.value,
      nurseId: userId,
      clientPhoto: fileBuffer ? fileBuffer.toString('base64') : null,
      status: 'applied'
    };

    return this.model.create(applicationData);
  }

  async findAllPaginated(query) {
    const filterOptions = {
      searchFields: [],
      filterFields: ['status', 'nurseId', 'stageId'],
      includes: this.defaultIncludes,
      defaultSort: [['createdAt', 'DESC']]
    };

    return super.findAllPaginated(query, filterOptions);
  }
}

module.exports = new ApplicationService();