// validation/clientSchema.js
const Joi = require('joi');

const clientSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().allow('', null).optional(),
  observation: Joi.string().allow('', null).optional(),
  cpf: Joi.string().allow('', null).optional()
});

module.exports = clientSchema;
