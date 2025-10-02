const Permission = require('../Permission/Permission');
const User = require('../User/User');

const permissionController = {
  async listPermissions(req, res) {
    try {
      const { userId } = req.params;
      
      if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      const defaultPermissions = {
        clients: {
          canCreate: ['admin', 'doctor', 'closing'].includes(user.role),
          canRead: true,
          canUpdate: ['admin', 'doctor', 'closing'].includes(user.role),
          canDelete: user.role === 'admin',
          allowedPages: ['/clients', '/clients/list', '/clients/details']
        },
        protocols: {
          canCreate: ['admin', 'closing'].includes(user.role),
          canRead: true,
          canUpdate: ['admin', 'closing'].includes(user.role),
          canDelete: user.role === 'admin',
          allowedPages: ['/protocols', '/protocols/list', '/protocols/details']
        },
        applications: {
          canCreate: ['admin', 'technique'].includes(user.role),
          canRead: true,
          canUpdate: ['admin', 'technique'].includes(user.role),
          canDelete: user.role === 'admin',
          allowedPages: ['/applications', '/applications/list', '/applications/details']
        },
        messages: {
          canCreate: ['admin', 'doctor', 'closing', 'technique'].includes(user.role),
          canRead: true,
          canUpdate: ['admin', 'doctor', 'closing', 'technique'].includes(user.role),
          canDelete: user.role === 'admin',
          allowedPages: ['/messages', '/messages/list', '/messages/details']
        },
        users: {
          canCreate: user.role === 'admin',
          canRead: user.role === 'admin',
          canUpdate: user.role === 'admin',
          canDelete: user.role === 'admin',
          allowedPages: ['/users', '/users/list', '/users/details']
        }
      };
      const permissions = await Permission.findAll({
        where: { userId }
      });

      if (!permissions || permissions.length === 0) {
        return res.json({ permissions: defaultPermissions });
      }

      const formattedPermissions = permissions.reduce((acc, perm) => {
        acc[perm.module] = {
          canCreate: perm.canCreate,
          canRead: perm.canRead,
          canUpdate: perm.canUpdate,
          canDelete: perm.canDelete,
          allowedPages: perm.allowedPages || []
        };
        return acc;
      }, {});

      const finalPermissions = {
        ...defaultPermissions,
        ...formattedPermissions
      };

      return res.json({ permissions: finalPermissions });
    } catch (error) {
      console.error('Erro ao listar permissões:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async updatePermissions(req, res) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado: apenas administradores podem gerenciar permissões' });
      }

      for (const perm of permissions) {
        await Permission.upsert({
          userId,
          module: perm.module,
          canCreate: perm.canCreate || false,
          canRead: perm.canRead || false,
          canUpdate: perm.canUpdate || false,
          canDelete: perm.canDelete || false,
          allowedPages: perm.allowedPages || []
        });
      }

      return res.json({ message: 'Permissões atualizadas com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async removePermission(req, res) {
    try {
      const { userId, module } = req.params;

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado: apenas administradores podem remover permissões' });
      }

      const permission = await Permission.findOne({
        where: { userId, module }
      });

      if (!permission) {
        return res.status(404).json({ message: 'Permissão não encontrada' });
      }

      await permission.destroy();
      return res.json({ message: 'Permissão removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

module.exports = permissionController;