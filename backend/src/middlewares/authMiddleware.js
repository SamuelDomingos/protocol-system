// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Erro ao verificar token:', err);
        return res.status(403).json({ message: 'Token inválido' });
      }

      // Adiciona o usuário ao request
      req.user = {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role
      };

      next();
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = authenticateToken;
