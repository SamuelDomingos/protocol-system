const Joi = require('joi');

const stockLocationSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(0).default(0),
  location: Joi.string().required(),
  price: Joi.number().precision(2).positive().allow(null),
  sku: Joi.string().allow(null),
  expiryDate: Joi.date().allow(null)
});

module.exports = stockLocationSchema;