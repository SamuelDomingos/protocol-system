const Joi = require('joi');

const kitSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome do kit é obrigatório',
    'string.min': 'Nome do kit deve ter no mínimo {#limit} caracteres',
    'string.max': 'Nome do kit deve ter no máximo {#limit} caracteres',
    'any.required': 'Nome do kit é obrigatório'
  }),

  description: Joi.string().allow('').messages({
    'string.base': 'Descrição deve ser um texto'
  }),

  category: Joi.string().allow(null, '').messages({
    'string.base': 'Categoria deve ser um texto'
  }),

  status: Joi.string().valid('active', 'inactive').default('active').messages({
    'any.only': 'Status deve ser "active" ou "inactive"',
    'string.base': 'Status deve ser um texto'
  }),

  products: Joi.array().items(
    Joi.object({
      productId: Joi.string().guid({ version: ['uuidv4'] }).required().messages({
        'string.guid': 'ID do produto deve ser um UUID válido',
        'any.required': 'ID do produto é obrigatório'
      }),
      quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantidade deve ser um número inteiro',
        'number.min': 'Quantidade mínima é 1',
        'any.required': 'Quantidade é obrigatória'
      })
    })
  ).optional().messages({
    'array.base': 'Produtos devem ser enviados como uma lista',
  })
});

module.exports = kitSchema;
