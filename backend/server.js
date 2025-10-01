const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const { securityHeaders, limiter, requestSizeLimit, sanitizeInput } = require('./middleware/security');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import route files
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const companyRoutes = require('./routes/companyRoutes');
const internRoutes = require('./routes/internRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const companyInternRoutes = require('./routes/companyInternRoutes');
const internCompanyRoutes = require('./routes/internCompanyRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
// Import other route files as needed
// const statsRoutes = require('./routes/statsRoutes');

// Connect to database
connectDB();

// Initialize express app
const app = express();

// --- Core Middleware ---

// Security headers
securityHeaders(app);

// Rate limiting (apply to all routes)
app.use(limiter);

// Cookie parser - must be before CORS
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust first proxy (if behind a proxy like nginx)
app.set('trust proxy', 1);

// Request size limiting
app.use(requestSizeLimit);

// Input sanitization
app.use(sanitizeInput);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, restrict to specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.CLIENT_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'X-Auth-Token',
    'Accept',
    'Content-Length',
    'Origin',
    'X-Forwarded-For',
    'Set-Cookie',
    'Cookie'
  ],
  exposedHeaders: [
    'Content-Range', 
    'X-Total-Count',
    'Set-Cookie',
    'Authorization',
    'X-Auth-Token'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Enable CORS with options
app.use((req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Auth-Token, Accept, Content-Length, Origin, X-Forwarded-For, Set-Cookie, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count, Set-Cookie, Authorization, X-Auth-Token');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Mount API routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interns', internRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/company-interns', companyInternRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/intern-companies', internCompanyRoutes);
app.use('/api/users', userRoutes);
// Mount other routes as needed
// app.use('/api/stats', statsRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Intern Finder API',
    version: '2.0.0'
  });
});

// --- Error Handling Middleware ---
// This MUST be the last middleware to catch all errors from the routes above
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
