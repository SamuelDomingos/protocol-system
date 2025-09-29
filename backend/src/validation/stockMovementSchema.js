const Joi = require('joi');

const stockMovementSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'string.empty': 'ID do produto é obrigatório',
    'any.required': 'ID do produto é obrigatório'
  }),
  type: Joi.string().valid('entrada', 'saida', 'transferencia', 'ajuste').required().messages({
    'string.empty': 'Tipo de movimentação é obrigatório',
    'any.only': 'Tipo deve ser: entrada, saida, transferencia ou ajuste',
    'any.required': 'Tipo de movimentação é obrigatório'
  }),
  quantity: Joi.number().integer().not(0).required().messages({
    'number.base': 'Quantidade deve ser um número',
    'number.integer': 'Quantidade deve ser um número inteiro',
    'any.invalid': 'Quantidade não pode ser zero',
    'any.required': 'Quantidade é obrigatória'
  }),
  fromLocationId: Joi.string().uuid().allow(null).messages({
    'string.guid': 'ID da localização de origem deve ser um UUID válido'
  }),
  toLocationId: Joi.string().uuid().allow(null).messages({
    'string.guid': 'ID da localização de destino deve ser um UUID válido'
  }),
  userId: Joi.string().uuid().required().messages({
    'string.empty': 'ID do usuário é obrigatório',
    'string.guid': 'ID do usuário deve ser um UUID válido',
    'any.required': 'ID do usuário é obrigatório'
  }),
  reason: Joi.string().max(255).allow(null, '').messages({
    'string.base': 'Motivo deve ser um texto',
    'string.max': 'Motivo deve ter no máximo 255 caracteres'
  }),
  notes: Joi.string().max(1000).allow(null, '').messages({
    'string.base': 'Observações devem ser um texto',
    'string.max': 'Observações devem ter no máximo 1000 caracteres'
  }),
  unitPrice: Joi.number().precision(2).positive().allow(null).messages({
    'number.base': 'Preço unitário deve ser um número',
    'number.precision': 'Preço unitário deve ter no máximo 2 casas decimais',
    'number.positive': 'Preço unitário deve ser um valor positivo'
  }),
  totalValue: Joi.number().precision(2).positive().allow(null).messages({
    'number.base': 'Valor total deve ser um número',
    'number.precision': 'Valor total deve ter no máximo 2 casas decimais',
    'number.positive': 'Valor total deve ser um valor positivo'
  })
}).custom((value, helpers) => {
  if (value.type === 'transferencia') {
    if (!value.fromLocationId || !value.toLocationId) {
      return helpers.error('custom.transferenceLocations');
    }
    if (value.fromLocationId === value.toLocationId) {
      return helpers.error('custom.sameLocations');
    }
  }
  
  if (value.type === 'entrada' && !value.toLocationId) {
    return helpers.error('custom.entradaLocationRequired');
  }
  
  if (value.type === 'saida' && !value.fromLocationId) {
    return helpers.error('custom.saidaLocationRequired');
  }
  
  return value;
}).messages({
  'custom.transferenceLocations': 'Transferência deve ter fornecedor/unidade de origem e destino',
  'custom.sameLocations': 'Fornecedor/unidade de origem e destino não podem ser iguais',
  'custom.entradaLocationRequired': 'Fornecedor/unidade de destino é obrigatório para entrada',
  'custom.saidaLocationRequired': 'Fornecedor/unidade de origem é obrigatório para saída'
});

module.exports = stockMovementSchema;