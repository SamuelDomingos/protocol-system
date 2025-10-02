const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome do produto é obrigatório',
    'string.min': 'Nome do produto deve ter no mínimo 2 caracteres',
    'string.max': 'Nome do produto deve ter no máximo 255 caracteres',
    'any.required': 'Nome do produto é obrigatório'
  }),
  description: Joi.string().allow("", null).messages({
    'string.base': 'Descrição deve ser um texto'
  }),
  unit: Joi.string().default("unidade").required().messages({
    'string.empty': 'Unidade é obrigatória',
    'string.base': 'Unidade deve ser um texto'
  }),
  category: Joi.string().allow("", null).required().messages({
    'string.empty': 'Categoria é obrigatória',
    'string.base': 'Categoria deve ser um texto'
  }),
  minimumStock: Joi.number().integer().min(0).default(5).messages({
    'number.base': 'Estoque mínimo deve ser um número',
    'number.integer': 'Estoque mínimo deve ser um número inteiro',
    'number.min': 'Estoque mínimo não pode ser negativo'
  }),
  status: Joi.string().valid("active", "inactive").default("active").messages({
    'any.only': 'Status deve ser "active" ou "inactive"'
  }),
  unitPrice: Joi.number().precision(2).min(0).allow(null).messages({
    'number.base': 'Preço unitário deve ser um número',
    'number.precision': 'Preço unitário deve ter no máximo 2 casas decimais',
    'number.min': 'Preço unitário não pode ser negativo'
  }),
});

module.exports = productSchema;
