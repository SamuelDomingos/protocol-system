const Joi = require('joi');

const stageSchema = Joi.object({
  id: Joi.string().uuid().messages({
    'string.guid': 'ID deve ser um UUID válido'
  }),
  protocolId: Joi.string().uuid().required().messages({
    'string.guid': 'ID do protocolo deve ser um UUID válido',
    'any.required': 'ID do protocolo é obrigatório'
  }),
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Nome do estágio é obrigatório',
    'string.min': 'Nome do estágio deve ter pelo menos 3 caracteres',
    'string.max': 'Nome do estágio deve ter no máximo 100 caracteres',
    'any.required': 'Nome do estágio é obrigatório'
  }),
  value: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'Valor deve ser um número',
    'number.precision': 'Valor deve ter no máximo 2 casas decimais',
    'number.min': 'Valor deve ser maior ou igual a 0',
    'any.required': 'Valor é obrigatório'
  }),
  intervalDays: Joi.number().integer().min(0).required().messages({
    'number.base': 'Intervalo de dias deve ser um número',
    'number.integer': 'Intervalo de dias deve ser um número inteiro',
    'number.min': 'Intervalo de dias deve ser maior ou igual a 0',
    'any.required': 'Intervalo de dias é obrigatório'
  }),
  order: Joi.number().integer().min(1).required().messages({
    'number.base': 'Ordem deve ser um número',
    'number.integer': 'Ordem deve ser um número inteiro',
    'number.min': 'Ordem deve ser maior ou igual a 1',
    'any.required': 'Ordem é obrigatória'
  })
});

module.exports = stageSchema;