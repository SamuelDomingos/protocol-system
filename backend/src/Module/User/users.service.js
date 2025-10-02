const BaseService = require('../../Module/Base/base.service');
const User = require('./User');
const userSchema = require('./usersSchema');

class UsersService extends BaseService {
  constructor() {
    super(User, userSchema);
  }

  async findAllUsers() {
    return await this.model.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
  }

  async findById(id) {
    const user = await this.model.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    
    if (!user) {
      throw { status: 404, message: 'Usuário não encontrado' };
    }
    
    return user;
  }

  async getUserPermissions(id) {
    const user = await this.findById(id);
  
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
    
    return permissions;
  }
}

module.exports = new UsersService();