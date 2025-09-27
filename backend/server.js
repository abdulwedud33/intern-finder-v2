const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

// Request size limiting
app.use(requestSizeLimit);

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Enable CORS with frontend URL
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Auth-Token'],
  exposedHeaders: ['Content-Range', 'X-Total-Count']
}));

// Handle preflight requests
app.options('*', cors());

// File uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Intern Finder API',
      version: '1.0.0',
      description: 'API for Intern Finder application',
      contact: {
        name: 'API Support',
        url: 'https://github.com/yourusername/intern-finder-backend',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.internfinder.app/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>'
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './docs/*.js',
    './controllers/*.js'
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Intern Finder API',
  customfavIcon: '/favicon.ico'
}));

// Serve Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- API Routes ---
const apiV1 = express.Router();

// Mount routes with API versioning
const API_PREFIX = '/api';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/applications`, applicationRoutes);
app.use(`${API_PREFIX}/jobs`, jobRoutes);
app.use(`${API_PREFIX}/companies`, companyRoutes);
app.use(`${API_PREFIX}/interns`, internRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/interviews`, interviewRoutes);
app.use(`${API_PREFIX}/company-interns`, companyInternRoutes);
app.use(`${API_PREFIX}/intern-companies`, internCompanyRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
// Mount other routes as needed
// app.use('/api/v1/stats', statsRoutes);

// Mount API version 1
app.use('/api', api);

// Redirect root to API documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// --- Error Handling Middleware ---
// This MUST be the last middleware to catch all errors from the routes above
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
