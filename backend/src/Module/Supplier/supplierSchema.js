const Joi = require('joi');

const supplierSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome do fornecedor é obrigatório',
    'string.min': 'Nome do fornecedor deve ter no mínimo 2 caracteres',
    'string.max': 'Nome do fornecedor deve ter no máximo 255 caracteres',
    'any.required': 'Nome do fornecedor é obrigatório'
  }),
  type: Joi.string().valid('unit', 'supplier').default('supplier').messages({
    'any.only': 'Tipo deve ser "unit" ou "supplier"'
  }),
  category: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Categoria é obrigatória',
    'string.min': 'Categoria deve ter no mínimo 2 caracteres',
    'string.max': 'Categoria deve ter no máximo 255 caracteres',
    'any.required': 'Categoria é obrigatória'
  }),
  notes: Joi.string().max(1000).allow(null, '').messages({
    'string.base': 'Observações devem ser um texto',
    'string.max': 'Observações devem ter no máximo 1000 caracteres'
  })
});

module.exports = supplierSchema;