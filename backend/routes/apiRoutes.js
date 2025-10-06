const express = require('express');
const router = express.Router();

/**
 * @desc    API Documentation and Status
 * @route   GET /api
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Intern Finder API v2.0',
    version: '2.0.0',
    documentation: {
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          register: 'POST /auth/register',
          logout: 'POST /auth/logout',
          me: 'GET /auth/me'
        },
        jobs: {
          getAll: 'GET /jobs',
          getById: 'GET /jobs/:id',
          getCompanyJobs: 'GET /jobs/company',
          getJobStats: 'GET /jobs/stats/company',
          create: 'POST /jobs',
          update: 'PUT /jobs/:id',
          delete: 'DELETE /jobs/:id'
        },
        applications: {
          create: 'POST /applications',
          getCompanyApplications: 'GET /applications/company',
          getCompanyStats: 'GET /applications/stats/company',
          getMyApplications: 'GET /applications/me',
          updateStatus: 'PUT /applications/:id/status'
        },
        interviews: {
          schedule: 'POST /interviews',
          getCompanyInterviews: 'GET /interviews/company',
          getMyInterviews: 'GET /interviews/me',
          update: 'PUT /interviews/:id',
          delete: 'DELETE /interviews/:id'
        },
        companies: {
          getAll: 'GET /companies',
          getById: 'GET /companies/:id',
          update: 'PUT /companies/:id'
        },
        stats: {
          applications: 'GET /stats/applications',
          interviews: 'GET /stats/interviews',
          dashboard: 'GET /stats/dashboard'
        }
      },
      authentication: {
        required: 'Bearer token in Authorization header',
        tokenFormat: 'Bearer <jwt_token>'
      },
      cors: {
        allowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://intern-finder-alpha.vercel.app'
        ],
        credentials: true
      }
    }
  });
});

module.exports = router;
