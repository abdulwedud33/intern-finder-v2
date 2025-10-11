const express = require('express');
const {
  createApplication,
  getCompanyApplications,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getCompanyApplicationStats,
  getMyApplicationStats,
  preCheckJob
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router({ mergeParams: true });

// Apply protect middleware to all routes
router.use(protect);

// Application submission
// Note: Application now uses Cloudinary URLs sent in request body, no file upload middleware needed
router.post('/', authorize('intern'), createApplication);

// Company routes
router.get('/company', authorize('company'), getCompanyApplications);
router.get('/stats/company', authorize('company'), getCompanyApplicationStats);

// Intern routes
router.get('/me', authorize('intern'), getMyApplications);
router.get('/stats/me', authorize('intern'), getMyApplicationStats);

// Pre-check route
router.get('/precheck/:jobId', authorize('intern'), preCheckJob);

// Application CRUD operations
router.route('/:id')
  .get(getApplicationById)
  .delete(deleteApplication);

// Status update route
router.put('/:id/status', authorize('company'), updateApplicationStatus);

module.exports = router;
