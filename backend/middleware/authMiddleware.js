const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { User } = require('../models/User');

// Protect routes - checks for a valid token (Authentication)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Get token from httpOnly cookie
    token = req.cookies.token;
  } else if (req.headers.cookie) {
    // Fallback: parse cookie from headers if cookie-parser fails
    const cookies = req.headers.cookie.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
      return cookies;
    }, {});
    token = cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Get user from the token
    let user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Check if user is active (if isActive field exists)
    if (user.isActive === false) {
      return next(new ErrorResponse('User account is inactive', 401));
    }
    
    // Attach user to request object
    req.user = user;
    
    // Debug logging for company users
    if (user.role === 'company') {
      console.log('Company user authenticated:', {
        id: user._id,
        name: user.name,
        role: user.role,
        company: user.company
      });
    }
    
    // Update last active timestamp (if field exists)
    if (user.lastActive !== undefined) {
      user.lastActive = Date.now();
      await user.save({ validateBeforeSave: false });
    }
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    
    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Invalid token', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Token expired', 401));
    }
    
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
