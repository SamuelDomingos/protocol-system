
const ERROR_MAPPINGS = {

  'SequelizeValidationError': (err) => ({
    status: 400,
    message: err.errors.map(e => e.message).join(', ')
  }),
  
  'SequelizeForeignKeyConstraintError': () => ({
    status: 400,
    message: 'Erro de chave estrangeira - registro relacionado não encontrado'
  }),
  
  'SequelizeUniqueConstraintError': (err) => ({
    status: 400,
    message: `Registro duplicado: ${err.errors?.[0]?.message || 'Este registro já existe'}`
  }),
  
  'SequelizeDatabaseError': () => ({
    status: 500,
    message: 'Erro interno do banco de dados'
  }),
  
  'SyntaxError': (err) => err.message.includes('JSON') ? {
    status: 400,
    message: 'Formato JSON inválido'
  } : null,
  
  'CastError': () => ({
    status: 400,
    message: 'Formato de ID inválido'
  }),

  // Adicionar tratamento específico para erros de validação do Joi
  'ValidationError': (err) => ({
    status: 400,
    message: err.details ? err.details.map(detail => detail.message).join(', ') : err.message
  })
};

const mapError = (err) => {
  // Verificar se é um erro customizado com status e message
  if (err.status && err.message) {
    return { status: err.status, message: err.message };
  }

  // Verificar se é um erro do Joi (que pode não ter o name 'ValidationError')
  if (err.details && Array.isArray(err.details)) {
    return {
      status: 400,
      message: err.details.map(detail => detail.message).join(', ')
    };
  }

  const mapper = ERROR_MAPPINGS[err.name];
  if (mapper) {
    const mapped = mapper(err);
    if (mapped) return mapped;
  }

  return {
    status: 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message || 'Erro interno do servidor'
  };
};

// Função asyncHandler que estava faltando
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  const { status, message } = mapError(err);

  if (status >= 500 || process.env.NODE_ENV !== 'production') {
    console.error(`❌ Erro [${status}]:`, {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  res.status(status).json({ 
    message,
    ...(process.env.NODE_ENV !== 'production' && status >= 500 && { 
      stack: err.stack 
    })
  });
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota ${req.originalUrl} não encontrada`);
  error.status = 404;
  next(error);
};

module.exports = asyncHandler; // Exporta asyncHandler como default
module.exports.errorHandler = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.ERROR_MAPPINGS = ERROR_MAPPINGS;