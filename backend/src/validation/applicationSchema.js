const Joi = require('joi');

const applicationSchema = Joi.object({
  stageId: Joi.string().guid({ version: ['uuidv4'] }).required().messages(),
  appliedAt: Joi.date().iso().required(),
  clientPhoto: Joi.string().required(),
  clientSignature: Joi.string().required(),
  nurseSignature: Joi.string().required()
});

module.exports = applicationSchema;
