const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async signup({ email, name, password, role }) {

    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.create({ email, name, password: hashedPassword, role });
  }

  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('INVALID_PASSWORD');

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, user };
  }

  async update(userId, { email, name, password, role }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    if (email) user.email = email;
    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;

    await user.save();
    return user;
  }
}

module.exports = new AuthService();
