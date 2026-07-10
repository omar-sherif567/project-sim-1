// middleware/errorHandler.js
const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 1. Mongoose Validation Error (e.g. Missing required fields)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((el) => el.message).join(', ');
    err = new AppError(message, 400);
  }

  // 2. Mongoose Cast Error (e.g. Invalid MongoDB ObjectId format in URL)
  if (err.name === 'CastError') {
    const message = `Invalid path structure: ${err.path} value of ${err.value} is invalid.`;
    err = new AppError(message, 400);
  }

  // 3. Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicate value field entered: "${value}". Please use another value!`;
    err = new AppError(message, 409);
  }

  // Send uniform json error envelope response payload
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};