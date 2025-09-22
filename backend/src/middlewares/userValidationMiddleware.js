const { Op } = require('sequelize');
const User = require('../models/User');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password.length >= 6;

const validateFields = (requiredFields = []) => {
  return async (req, res, next) => {
    try {
      const body = req.body;

      for (const field of requiredFields) {
        if (!body[field]) {
          return res.status(400).json({ message: `Campo obrigatório: ${field}` });
        }
      }

      if (body.email && !isValidEmail(body.email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }

      if (body.password && !isValidPassword(body.password)) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
      }

      next();
    } catch (error) {
      console.error('Erro ao validar campos:', error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  };
};

const checkUserExists = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ name }, { email }] }
    });

    if (existingUser) {
      const field = existingUser.name === name ? 'nome' : 'email';
      return res.status(400).json({ message: `${field} já está em uso` });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar existência do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

exports.validateSignupFields = validateFields(['email', 'name', 'password']);
exports.validateLoginFields = validateFields(['email', 'password']);
exports.validateUpdateFields = validateFields(['email', 'name', 'password']);
exports.checkUserExists = checkUserExists;
