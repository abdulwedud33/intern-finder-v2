const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Security headers
const securityHeaders = (app) => {
  // Set security HTTP headers
  app.use(helmet());
  
  // Prevent XSS attacks
  app.use(helmet.xssFilter());
  
  // Prevent clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));
};

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again after 15 minutes'
    });
  }
});

// Request size limiting
const requestSizeLimit = (req, res, next) => {
  // Limit to 10MB for JSON and urlencoded payloads
  const limit = '10mb';
  
  // Only parse as much of the body as 10MB
  if (req.is('json') || req.is('urlencoded')) {
    if (parseInt(req.get('content-length') || '0') > 10 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'Request entity too large. Maximum size is 10MB.'
      });
    }
  }
  
  next();
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  // Remove $ and . from req.body, req.query, and req.params
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);
  
  next();
};

module.exports = {
  securityHeaders,
  limiter,
  requestSizeLimit,
  sanitizeInput
};
