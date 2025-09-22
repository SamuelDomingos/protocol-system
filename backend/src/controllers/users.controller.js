const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'role', 'createdAt']
    });

    res.status(200).json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('❌ Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const value = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Se veio senha nova, já hash
    if (value.password) {
      value.password = await bcrypt.hash(value.password, 10);
    }

    await user.update(value);
    res.status(200).json({ message: 'User updated', user });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mapear as permissões baseadas no role do usuário
    const permissions = {
      clients: {
        canCreate: ['admin', 'doctor', 'closing'].includes(user.role),
        canRead: true,
        canUpdate: ['admin', 'doctor', 'closing'].includes(user.role),
        canDelete: user.role === 'admin',
        allowedPages: ['/clients', '/clients/new', '/clients/[id]']
      },
      protocols: {
        canCreate: ['admin', 'closing'].includes(user.role),
        canRead: true,
        canUpdate: ['admin', 'closing'].includes(user.role),
        canDelete: user.role === 'admin',
        allowedPages: ['/protocols', '/protocols/new', '/protocols/[id]']
      },
      applications: {
        canCreate: ['admin', 'technique'].includes(user.role),
        canRead: true,
        canUpdate: ['admin', 'technique'].includes(user.role),
        canDelete: user.role === 'admin',
        allowedPages: ['/applications', '/applications/new', '/applications/[id]']
      },
      users: {
        canCreate: user.role === 'admin',
        canRead: user.role === 'admin',
        canUpdate: user.role === 'admin',
        canDelete: user.role === 'admin',
        allowedPages: ['/users', '/users/new', '/users/[id]']
      },
      stock: {
        canCreate: ['admin', 'stock'].includes(user.role),
        canRead: true,
        canUpdate: ['admin', 'stock'].includes(user.role),
        canDelete: user.role === 'admin',
        allowedPages: ['/stock', '/stock/new', '/stock/[id]']
      }
    };

    res.status(200).json(permissions);
  } catch (err) {
    console.error('❌ Error fetching user permissions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    // Se chegou aqui, significa que o middleware de autenticação já validou o token
    // e adicionou o usuário ao request
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('❌ Error verifying token:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};