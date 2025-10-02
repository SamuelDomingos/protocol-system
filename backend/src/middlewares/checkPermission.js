const Permission = require('../Module/Permission/Permission');

// Função para verificar se o usuário tem permissão para uma ação específica
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Se for admin, permite tudo
      if (req.user.role === 'admin') {
        return next();
      }

      // Buscar permissão do usuário para o módulo
      const permission = await Permission.findOne({
        where: {
          userId: req.user.id,
          module
        }
      });

      if (!permission) {
        return res.status(403).json({ message: 'Acesso negado: permissão não encontrada' });
      }

      // Verificar se o usuário tem permissão para a ação
      const hasPermission = permission[`can${action.charAt(0).toUpperCase() + action.slice(1)}`];
      
      if (!hasPermission) {
        return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

module.exports = checkPermission; 