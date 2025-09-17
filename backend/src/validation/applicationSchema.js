const Joi = require('joi');

const applicationSchema = Joi.object({
  stageId: Joi.number().integer().required(),
  appliedAt: Joi.date().iso().required(),
  clientPhoto: Joi.string().required(), // base64 ou path
  clientSignature: Joi.string().required(),
  nurseSignature: Joi.string().required()
});

module.exports = applicationSchema;
