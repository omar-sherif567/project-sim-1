const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((el) => el.message).join(', ');
    err = new AppError(message, 400);
  }

  if (err.name === 'CastError') {
    const message = `Invalid path structure: ${err.path} value of ${err.value} is invalid.`;
    err = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicate value field entered: "${value}". Please use another value!`;
    err = new AppError(message, 409);
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};