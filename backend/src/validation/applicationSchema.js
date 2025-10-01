const Joi = require('joi');

const applicationSchema = Joi.object({
  stageId: Joi.string().guid({ version: ['uuidv4'] }).required().messages({
    'string.empty': 'ID do estágio é obrigatório',
    'string.guid': 'ID do estágio deve ser um UUID válido',
    'any.required': 'ID do estágio é obrigatório'
  }),
  appliedAt: Joi.date().iso().required().messages({
    'date.base': 'Data de aplicação deve ser uma data válida',
    'date.format': 'Data de aplicação deve estar no formato ISO',
    'any.required': 'Data de aplicação é obrigatória'
  }),
  clientPhoto: Joi.string().required().messages({
    'string.empty': 'Foto do cliente é obrigatória',
    'string.base': 'Foto do cliente deve ser um texto (base64)',
    'any.required': 'Foto do cliente é obrigatória'
  }),
  clientSignature: Joi.string().required().messages({
    'string.empty': 'Assinatura do cliente é obrigatória',
    'string.base': 'Assinatura do cliente deve ser um texto',
    'any.required': 'Assinatura do cliente é obrigatória'
  }),
  nurseSignature: Joi.string().required().messages({
    'string.empty': 'Assinatura do enfermeiro é obrigatória',
    'string.base': 'Assinatura do enfermeiro deve ser um texto',
    'any.required': 'Assinatura do enfermeiro é obrigatória'
  }),
  status: Joi.string().valid('applied', 'completed', 'cancelled').default('applied').messages({
    'any.only': 'Status deve ser "applied", "completed" ou "cancelled"'
  }),
  completedAt: Joi.date().iso().allow(null).messages({
    'date.base': 'Data de conclusão deve ser uma data válida',
    'date.format': 'Data de conclusão deve estar no formato ISO'
  }),
  completedBy: Joi.string().guid({ version: ['uuidv4'] }).allow(null).messages({
    'string.guid': 'ID do usuário que completou deve ser um UUID válido'
  })
});

module.exports = applicationSchema;
