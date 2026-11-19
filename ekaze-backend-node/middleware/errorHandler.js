const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode || 500;

  if (env.NODE_ENV === 'development') {
    console.error('❌ API Error:', err);
  }

  // Zero Info Leakage in Production: suppress stack traces and raw DB errors
  const response = {
    success: false,
    message: err.isOperational ? err.message : 'An error occurred on the server. Please try again later.'
  };

  if (env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
