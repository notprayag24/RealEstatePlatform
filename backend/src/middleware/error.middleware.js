// src/middleware/error.middleware.js - Global error handler

const errorHandler = (err, req, res, next) => {
  // Log error
  console.error(`Error: ${err.message}`);
  
  // Default error response
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { status: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { status: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { status: 400, message: message.join(', ') };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { status: 401, message: 'Invalid token' };
  }

  if (err.name === 'TokenExpiredError') {
    error = { status: 401, message: 'Token expired' };
  }

  // Send response
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;