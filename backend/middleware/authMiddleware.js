const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { User } = require('../models/User');

// Protect routes - checks for a valid token (Authentication)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    let user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorResponse('User account is inactive', 401));
    }
    
    // Attach user to request object
    req.user = user;
    
    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles (Authorization)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    
    next();
  };
};

// Role-based access control
exports.role = {
  // Only allow interns
  intern: (req, res, next) => {
    if (req.user.role !== 'intern') {
      return next(
        new ErrorResponse('Only interns can access this route', 403)
      );
    }
    next();
  },
  
  // Only allow companies
  company: (req, res, next) => {
    if (req.user.role !== 'company') {
      return next(
        new ErrorResponse('Only companies can access this route', 403)
      );
    }
    next();
  },
  
  // Allow both interns and companies
  any: (req, res, next) => {
    if (!['intern', 'company'].includes(req.user.role)) {
      return next(
        new ErrorResponse('Only authenticated users can access this route', 403)
      );
    }
    next();
  }
};

// Check if user is the owner of the resource
exports.ownership = (model, paramName = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resource = await model.findById(req.params[paramName]);
    
    if (!resource) {
      return next(new ErrorResponse('Resource not found', 404));
    }
    
    // Check if user is the owner or an admin
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse('Not authorized to modify this resource', 403)
      );
    }
    
    next();
  });
};
