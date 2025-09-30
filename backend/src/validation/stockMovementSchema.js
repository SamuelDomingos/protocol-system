const Joi = require('joi');

const stockMovementSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  type: Joi.string().valid('entrada', 'saida', 'transferencia').required(),
  quantity: Joi.number().integer().min(1).required(),

  // Para transferência entre suppliers
  fromLocationId: Joi.string().uuid().when('type', {
    is: 'transferencia',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  fromLocationType: Joi.string().valid('supplier').when('type', {
    is: 'transferencia', 
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  // Para entrada (origem supplier) e saída (destino supplier/user/client)
  toLocationId: Joi.string().uuid().when('type', {
    is: Joi.valid('entrada', 'saida', 'transferencia'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  toLocationType: Joi.string().valid('supplier', 'user', 'client').when('type', {
    is: Joi.valid('entrada', 'saida', 'transferencia'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  
  reason: Joi.string().optional(),
  notes: Joi.string().optional(),
  unitPrice: Joi.number().min(0).optional(),
  totalValue: Joi.number().min(0).optional(),
  sku: Joi.string().optional(),
  expiryDate: Joi.date().optional(),
});

module.exports = { stockMovementSchema };