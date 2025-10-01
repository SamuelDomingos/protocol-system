const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome do usuário é obrigatório',
    'string.min': 'Nome do usuário deve ter no mínimo 2 caracteres',
    'string.max': 'Nome do usuário deve ter no máximo 255 caracteres',
    'any.required': 'Nome do usuário é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email é obrigatório',
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).max(255).required().messages({
    'string.empty': 'Senha é obrigatória',
    'string.min': 'Senha deve ter no mínimo 6 caracteres',
    'string.max': 'Senha deve ter no máximo 255 caracteres',
    'any.required': 'Senha é obrigatória'
  }),
  role: Joi.string().messages({
    'any.only': 'Tipo deve ser "user" ou "admin"'
  })    
});

module.exports = userSchema;
