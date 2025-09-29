const Joi = require('joi');

const stockMovementSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  type: Joi.string().valid('entrada', 'saida', 'transferencia').required(),
  quantity: Joi.number().integer().min(1).required(),
  
  // Campos polimórficos para origem
  fromLocationId: Joi.string().uuid().optional(),
  fromLocationType: Joi.string().valid('supplier', 'user', 'client').optional(),
  
  // Campos polimórficos para destino
  toLocationId: Joi.string().uuid().optional(),
  toLocationType: Joi.string().valid('supplier', 'user', 'client').optional(),
  
  reason: Joi.string().optional(),
  notes: Joi.string().optional(),
  unitPrice: Joi.number().min(0).optional(),
  totalValue: Joi.number().min(0).optional(),
  sku: Joi.string().optional(),
  expiryDate: Joi.date().optional(),
}).custom((value, helpers) => {
  const { type, fromLocationId, fromLocationType, toLocationId, toLocationType, reason } = value;

  // Validação para transferência
  if (type === 'transferencia') {
    if (!fromLocationId || !fromLocationType || !toLocationId || !toLocationType) {
      return helpers.error('custom.transferencia');
    }
  }

  // Validação para entrada
  if (type === 'entrada') {
    if (!fromLocationId || !fromLocationType) {
      return helpers.error('custom.entrada');
    }
  }

  // Validação para saída
  if (type === 'saida') {
    // Alguns tipos de saída não precisam de destino
    const noDestinationReasons = ['doacao', 'perda', 'vencido', 'descarte'];
    if (!noDestinationReasons.includes(reason) && (!toLocationId || !toLocationType)) {
      return helpers.error('custom.saida');
    }
  }

  if (fromLocationId && !fromLocationType) {
    return helpers.error('custom.fromLocationTypeRequired');
  }
  if (fromLocationType && !fromLocationId) {
    return helpers.error('custom.fromLocationIdRequired');
  }
  if (toLocationId && !toLocationType) {
    return helpers.error('custom.toLocationTypeRequired');
  }
  if (toLocationType && !toLocationId) {
    return helpers.error('custom.toLocationIdRequired');
  }

  return value;
}, 'Validação de movimentação de estoque').messages({
  'custom.transferencia': 'Transferência deve ter origem e destino definidos',
  'custom.entrada': 'Entrada deve ter origem definida',
  'custom.saida': 'Saída deve ter destino definido (exceto para doação, perda, vencido ou descarte)',
  'custom.fromLocationTypeRequired': 'fromLocationType é obrigatório quando fromLocationId está presente',
  'custom.fromLocationIdRequired': 'fromLocationId é obrigatório quando fromLocationType está presente',
  'custom.toLocationTypeRequired': 'toLocationType é obrigatório quando toLocationId está presente',
  'custom.toLocationIdRequired': 'toLocationId é obrigatório quando toLocationType está presente',
});

module.exports = { stockMovementSchema };