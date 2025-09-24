const Joi = require('joi');

const stageSchema = Joi.object({
  id: Joi.string().uuid(),
  protocolId: Joi.string().uuid().required(),
  name: Joi.string().min(3).max(100).required(),
  value: Joi.number().precision(2).min(0).required(),
  intervalDays: Joi.number().integer().min(0).required(),
  order: Joi.number().integer().min(1).required()
});

module.exports = stageSchema;