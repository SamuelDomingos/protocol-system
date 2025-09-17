const role = (allowedRoles = []) => {
  return (req, res, next) => {
    // Se não houver roles específicas definidas, permite qualquer role
    if (!allowedRoles || allowedRoles.length === 0) {
      return next();
    }

    // Verifica se o usuário tem uma role
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Acesso negado: Papel não definido' });
    }

    // Se o usuário for admin, permite acesso a tudo
    if (req.user.role === 'admin') {
      return next();
    }

    // Verifica se a role do usuário está nas roles permitidas
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Acesso negado: Papel não autorizado' });
  };
};

module.exports = role;
