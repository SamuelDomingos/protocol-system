const BaseController = require('../Base/base.controller');
const applicationService = require('./applications.service');
const asyncHandler = require('../../utils/asyncHandler');

class ApplicationController extends BaseController {
  constructor() {
    super(applicationService, 'applications');
  }

  create = asyncHandler(async (req, res) => {
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    if (isMultipart) {
      const data = {
        stageId: req.body.stageId,
        appliedAt: req.body.appliedAt,
        clientSignature: req.body.clientSignature,
        nurseSignature: req.body.nurseSignature
      };
      
      const result = await this.service.createWithFile(
        data, 
        req.file?.buffer, 
        req.user.id
      );
      
      res.status(201).json(result);
    } else {
      const additionalData = { nurseId: req.user.id, status: 'applied' };
      const result = await this.service.create(req.body, additionalData);
      res.status(201).json(result);
    }
  });

  getByStage = asyncHandler(async (req, res) => {
    const { stageId } = req.params;
    const applications = await this.service.findByStage(stageId);
    res.json(applications);
  });

  complete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const application = await this.service.complete(id, req.user.id);
    res.json({ message: 'Application completed', application });
  });
}

const applicationController = new ApplicationController();

exports.createApplication = applicationController.create;
exports.getAllApplications = applicationController.getAll;
exports.getApplicationById = applicationController.getById;
exports.updateApplication = applicationController.update;
exports.deleteApplication = applicationController.delete;
exports.getApplicationsByStage = applicationController.getByStage;
exports.completeApplication = applicationController.complete;