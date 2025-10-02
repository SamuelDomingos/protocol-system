const Joi = require('joi');

const stageSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nome do estágio é obrigatório',
    'any.required': 'Nome do estágio é obrigatório'
  }),
  value: Joi.number().precision(2).optional().messages({
    'number.base': 'Valor deve ser um número',
    'number.precision': 'Valor deve ter no máximo 2 casas decimais'
  }),
  intervalDays: Joi.number().integer().optional().messages({
    'number.base': 'Intervalo de dias deve ser um número',
    'number.integer': 'Intervalo de dias deve ser um número inteiro'
  }),
  order: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Ordem deve ser um número',
    'number.integer': 'Ordem deve ser um número inteiro',
    'number.min': 'Ordem deve ser maior ou igual a 1'
  })
});

const protocolSchema = Joi.object({
  clientId: Joi.when('isTemplate', {
    is: true,
    then: Joi.allow(null),
    otherwise: Joi.string().uuid().required().messages({
      'string.guid': 'ID do cliente deve ser um UUID válido',
      'any.required': 'ID do cliente é obrigatório para protocolos'
    })
  }),
  title: Joi.string().required().messages({
    'string.empty': 'Título é obrigatório',
    'any.required': 'Título é obrigatório'
  }),
  isTemplate: Joi.boolean().messages(),
  stages: Joi.array().items(stageSchema).min(1).required().messages({
    'array.base': 'Estágios devem ser uma lista',
    'array.min': 'É necessário pelo menos 1 estágio',
    'any.required': 'Estágios são obrigatórios'
  })
});

module.exports = protocolSchema;
