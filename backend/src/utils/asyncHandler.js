
const ERROR_MAPPINGS = {

  'SequelizeValidationError': (err) => ({
    status: 400,
    message: err.errors.map(e => e.message).join(', ')
  }),
  
  'SequelizeForeignKeyConstraintError': () => ({
    status: 400,
    message: 'Foreign key constraint error'
  }),
  
  'SequelizeUniqueConstraintError': (err) => ({
    status: 400,
    message: `Duplicate entry: ${err.errors?.[0]?.message || 'Record already exists'}`
  }),
  
  'SequelizeDatabaseError': () => ({
    status: 500,
    message: 'Database error occurred'
  }),
  
  'SyntaxError': (err) => err.message.includes('JSON') ? {
    status: 400,
    message: 'Invalid JSON format'
  } : null,
  
  'CastError': () => ({
    status: 400,
    message: 'Invalid ID format'
  }),
  
  'JsonWebTokenError': () => ({
    status: 401,
    message: 'Invalid token'
  }),
  
  'TokenExpiredError': () => ({
    status: 401,
    message: 'Token expired'
  })
};

const mapError = (err) => {
  if (err.status && err.message) {
    return { status: err.status, message: err.message };
  }

  const mapper = ERROR_MAPPINGS[err.name];
  if (mapper) {
    const mapped = mapper(err);
    if (mapped) return mapped;
  }

  return {
    status: 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Internal server error'
  };
};

// Função asyncHandler que estava faltando
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  const { status, message } = mapError(err);

  if (status >= 500 || process.env.NODE_ENV !== 'production') {
    console.error(`❌ Error [${status}]:`, {
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
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
};

module.exports = asyncHandler; // Exporta asyncHandler como default
module.exports.errorHandler = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.ERROR_MAPPINGS = ERROR_MAPPINGS;