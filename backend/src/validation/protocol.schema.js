const Joi = require('joi');

const stageSchema = Joi.object({
  name: Joi.string().required(),
  value: Joi.number().precision(2).optional(),
  intervalDays: Joi.number().integer().optional()
});

const protocolSchema = Joi.object({
  clientId: Joi.when('isTemplate', {
    is: true,
    then: Joi.allow(null),
    otherwise: Joi.number().integer().required()
  }),
  title: Joi.string().required(),
  isTemplate: Joi.boolean().required(),
  stages: Joi.array().items(stageSchema).min(1).required()
});

module.exports = protocolSchema;
