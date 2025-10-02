const Joi = require('joi');

const stockMovementSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'string.empty': 'ID do produto é obrigatório',
    'any.required': 'ID do produto é obrigatório',
    'string.uuid': 'ID do produto deve ser um UUID válido'
  }),
  type: Joi.string().valid('entrada', 'saida', 'transferencia').required().messages({
    'string.empty': 'Tipo de movimentação é obrigatório',
    'any.required': 'Tipo de movimentação é obrigatório',
    'any.only': 'Tipo deve ser: entrada, saida ou transferencia'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantidade deve ser um número',
    'number.integer': 'Quantidade deve ser um número inteiro',
    'number.min': 'Quantidade deve ser maior que zero',
    'any.required': 'Quantidade é obrigatória'
  }),
  fromLocationId: Joi.string().uuid().when('type', {
    is: Joi.valid('saida', 'transferencia'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.empty': 'Local de origem é obrigatório para saídas e transferências',
    'any.required': 'Local de origem é obrigatório para saídas e transferências',
    'string.uuid': 'ID do local de origem deve ser um UUID válido'
  }),
  fromLocationType: Joi.string().valid('supplier', 'user', 'client').when('type', {
    is: Joi.valid('saida', 'transferencia'), 
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.empty': 'Tipo do local de origem é obrigatório para saídas e transferências',
    'any.required': 'Tipo do local de origem é obrigatório para saídas e transferências',
    'any.only': 'Tipo do local deve ser: supplier, user ou client'
  }),

  toLocationId: Joi.string().uuid().when('type', {
    is: Joi.valid('entrada', 'transferencia'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.empty': 'Local de destino é obrigatório para entradas e transferências',
    'any.required': 'Local de destino é obrigatório para entradas e transferências',
    'string.uuid': 'ID do local de destino deve ser um UUID válido'
  }),
  toLocationType: Joi.string().valid('supplier', 'user', 'client').when('type', {
    is: Joi.valid('entrada', 'transferencia'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.empty': 'Tipo do local de destino é obrigatório para entradas e transferências',
    'any.required': 'Tipo do local de destino é obrigatório para entradas e transferências',
  }),
  
  reason: Joi.string().when('type', {
    is: 'saida',
    then: Joi.string().required().min(1),
    otherwise: Joi.string().allow('').optional()
  }).messages({
    'string.empty': 'Tipo de saída (motivo) é obrigatório',
    'any.required': 'Tipo de saída (motivo) é obrigatório',
    'string.min': 'Motivo não pode estar vazio'
  }),
  
  notes: Joi.string().allow('').optional().messages({
    'string.base': 'Observações devem ser um texto'
  }),
  unitPrice: Joi.number().min(0).optional().messages({
    'number.base': 'Preço unitário deve ser um número',
    'number.min': 'Preço unitário não pode ser negativo'
  }),
  totalValue: Joi.number().min(0).optional().messages({
    'number.base': 'Valor total deve ser um número',
    'number.min': 'Valor total não pode ser negativo'
  }),
  sku: Joi.string().when('type', {
    is: Joi.valid('saida', 'transferencia'),
    then: Joi.string().required().min(1),
    otherwise: Joi.string().allow('').optional()
  }).messages({
    'string.empty': 'SKU é obrigatório para saídas e transferências',
    'any.required': 'SKU é obrigatório para saídas e transferências',
    'string.min': 'SKU não pode estar vazio'
  }),
  
  expiryDate: Joi.date().optional().messages({
    'date.base': 'Data de validade deve ser uma data válida'
  }),
  
  userId: Joi.string().uuid().optional().messages({
    'string.empty': 'ID do usuário deve ser válido',
    'string.uuid': 'ID do usuário deve ser um UUID válido'
  })
});

module.exports = { stockMovementSchema };