// Classe AuthService estendendo BaseService
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BaseService = require('./base.service');
const User = require('../models/User');
const userSchema = require('../validation/usersSchema');

class AuthService extends BaseService {
  constructor() {
    super(User, userSchema);
  }

  async signup({ email, name, password, role }) {
    const { value } = this.validate({ email, name, password, role });

    const hashedPassword = await bcrypt.hash(value.password, 10);
    return this.model.create({ ...value, password: hashedPassword });
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw { status: 400, message: 'Email e senha são obrigatórios' };
    }

    const user = await this.model.findOne({ where: { email } });
    if (!user) {
      throw { status: 404, message: 'Usuário não encontrado' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: 'Senha inválida' };
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, user };
  }

  async update(userId, { email, name, password, role }) {

    const updateSchema = userSchema
      .fork(['name', 'email', 'password', 'role'], (s) => s.optional())
      .min(1);

    const { error, value } = updateSchema.validate({ email, name, password, role });
    if (error) {
      throw { status: 400, message: error.details[0].message };
    }

    const user = await this.checkExists(userId, 'Usuário não encontrado');

    if (value.email) user.email = value.email;
    if (value.name) user.name = value.name;
    if (value.password) user.password = await bcrypt.hash(value.password, 10);
    if (value.role) user.role = value.role;

    await user.save();
    return user;
  }
}

module.exports = new AuthService();
