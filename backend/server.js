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
// const uploadRoutes = require('./routes/uploadRoutes'); // Removed - using Cloudinary uploads
const cloudinaryUploadRoutes = require('./routes/cloudinaryUploadRoutes');
const statsRoutes = require('./routes/statsRoutes');
const apiRoutes = require('./routes/apiRoutes');
// Import other route files as needed

// Import models to ensure they are registered with Mongoose
// Load base models first - User must be loaded before Company (discriminator)
require('./models/User');
require('./models/Intern');
require('./models/Company');
// Load dependent models that reference the base models
require('./models/Job');
require('./models/Application');
require('./models/Interview');
require('./models/Review');
require('./models/CompanyReview');
require('./models/InternReview');
require('./models/CompanyIntern');

// Connect to database after models are loaded
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

// Static file serving removed - using Cloudinary for all file uploads

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins for development
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('Allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      console.log('Allowing origin in development:', origin);
      return callback(null, true);
    }
    
    // In production, restrict to specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.CLIENT_URL,
      'https://intern-finder-alpha.vercel.app',
      // Add more production domains as needed
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      console.log('Allowing production origin:', origin);
      return callback(null, true);
    }
    
    // Log the origin for debugging
    console.log('CORS blocked origin:', origin);
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
app.use(cors(corsOptions));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Mount API routes with /api prefix
app.use('/api', apiRoutes); // API documentation
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/interns', internRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/company-interns', companyInternRoutes);
// app.use('/api/uploads', uploadRoutes); // Removed - using Cloudinary uploads
app.use('/api/uploads/cloudinary', cloudinaryUploadRoutes);
app.use('/api/intern-companies', internCompanyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Intern Finder API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      interviews: '/api/interviews',
      companies: '/api/companies',
      interns: '/api/interns',
      stats: '/api/stats',
      uploads: '/api/uploads'
    }
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
