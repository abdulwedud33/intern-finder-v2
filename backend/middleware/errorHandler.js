// File: server/middleware/errorHandler.js

const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for the developer
  console.error(err);

  // REFINED: Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    // Get the field that caused the error from the error object
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    // Create a much more descriptive message
    const message = `The ${field} '${value}' is already in use. Please use another value.`;

    // Use status code 409 Conflict, which is more semantic for this error
    error = new ErrorResponse(message, 409);
  }

  // Handle Mongoose validation errors (e.g., missing required fields)
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
