const Joi = require('joi');

const stockLocationSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'string.empty': 'ID do produto é obrigatório',
    'any.required': 'ID do produto é obrigatório'
  }),
  quantity: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Quantidade deve ser um número',
    'number.integer': 'Quantidade deve ser um número inteiro',
    'number.min': 'Quantidade não pode ser negativa'
  }),
  location: Joi.string().uuid().required().messages({
    'string.empty': 'ID do fornecedor/unidade é obrigatório',
    'string.guid': 'ID do fornecedor/unidade deve ser um UUID válido',
    'any.required': 'Fornecedor/unidade é obrigatório'
  }),
  price: Joi.number().precision(2).positive().allow(null).messages({
    'number.base': 'Preço deve ser um número',
    'number.precision': 'Preço deve ter no máximo 2 casas decimais',
    'number.positive': 'Preço deve ser um valor positivo'
  }),
  sku: Joi.string().max(50).allow(null, '').messages({
    'string.base': 'SKU deve ser um texto',
    'string.max': 'SKU deve ter no máximo 50 caracteres'
  }),
  expiryDate: Joi.date().allow(null).messages({
    'date.base': 'Data de validade deve ser uma data válida'
  })
});

module.exports = stockLocationSchema;