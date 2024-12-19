const ErrorResponse = require("../utils/errorResponse");
const colors = require('colors');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  
  // Fix: Preserve the prototype chain for proper instanceof checks
  Object.setPrototypeOf(error, Object.getPrototypeOf(err));
  
  error.message = err.message || 'Server Error';
  error.statusCode = err.statusCode;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.log(colors.red(err.stack));
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key - Fix: Better handling of nested fields
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const message = field
      ? `Duplicate value entered for ${field}`
      : 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error - Fix: Better formatting for nested errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => {
      if (val.kind === 'ObjectId') {
        return `Invalid ${val.path}: Resource not found`;
      }
      return val.message;
    });
    error = new ErrorResponse(message, 400);
  }

  // JWT specific errors - Fix: More specific error messages
  if (err.name === "JsonWebTokenError") {
    const message = err.message === 'jwt malformed' 
      ? "Invalid token format" 
      : "Authentication failed. Please log in again";
    error = new ErrorResponse(message, 401);
  }

  // JWT Token expired
  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again";
    error = new ErrorResponse(message, 401);
  }

  // File upload error
  if (err.name === "MulterError") {
    const message = `File upload error: ${err.message}`;
    error = new ErrorResponse(message, 400);
  }

  // Syntax error
  if (err.name === "SyntaxError") {
    const message = `Invalid syntax: ${err.message}`;
    error = new ErrorResponse(message, 400);
  }

  // Network/Database connection error
  if (err.name === "MongoNetworkError") {
    const message = "Database connection error. Please try again later";
    error = new ErrorResponse(message, 503);
  }

  // MongoDB timeout error
  if (err.name === "MongoTimeoutError") {
    const message = "Database operation timed out. Please try again";
    error = new ErrorResponse(message, 504);
  }

  // Prepare response - Fix: Better response structure
  const response = {
    success: false,
    error: {
      message: error.message || "Server Error",
      code: error.statusCode || 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(response.error.code).json(response);
};

module.exports = errorHandler;
