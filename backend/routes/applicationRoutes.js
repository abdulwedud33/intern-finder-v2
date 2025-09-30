const express = require('express');
const {
  createApplication,
  getCompanyApplications,
  getMyApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
  getCompanyApplicationStats,
  getMyApplicationStats,
  checkApplicationAccess,
  preCheckJob
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Apply protect middleware to all routes
router.use(protect);

// Application submission
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
  .all(checkApplicationAccess)  // Apply to all routes with :id
  .get(getApplication)
  .delete(deleteApplication);

// Status update route
router.put('/:id/status', authorize('company'), updateApplicationStatus);

module.exports = router;
