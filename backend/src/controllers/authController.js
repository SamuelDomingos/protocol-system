const authService = require('../services/authService');
const permissionService = require('../services/permissionService');

exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error('Erro no signup:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') return res.status(401).json({ message: 'User not found' });
    if (err.message === 'INVALID_PASSWORD') return res.status(401).json({ message: 'Incorrect password' });
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await authService.update(req.user.id, req.body);
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error('Erro no update:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
}