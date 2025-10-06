// File: server/middleware/errorHandler.js

const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for the developer
  console.error('Error Handler:', err);

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `The ${field} '${value}' is already in use. Please use another value.`;
    error = new ErrorResponse(message, 409);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ErrorResponse(message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    const message = 'CORS policy violation';
    error = new ErrorResponse(message, 403);
  }

  // Ensure response is always JSON
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
