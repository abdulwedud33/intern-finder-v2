const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobsInRadius,
  jobPhotoUpload,
  getJobStats,
  closeJob,
  getCompanyJobs,
  searchJobs,
  getJobsByCompany
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  validateCreateJob, 
  validateUpdateJob, 
  checkJobOwnership,
  validateFileUpload 
} = require('../middleware/validators/jobValidator');
const router = express.Router();
// Public routes
router.get('/', getJobs);
router.get('/detail/:id', getJob);
router.get('/search', searchJobs);
router.get('/company/:companyId', getJobsByCompany);
router.get('/radius/:zipcode/:distance', getJobsInRadius);
// Protected routes (require authentication)
router.use(protect);
// Company routes
router.get('/company', authorize('company'), getCompanyJobs);
router.get('/stats/company', authorize('company'), getJobStats);
// Job CRUD operations
router.post(
  '/',
  authorize('company'),
  validateFileUpload,
  validateCreateJob,
  createJob
);
router.put(
  '/:id',
  authorize('company'),
  checkJobOwnership,
  validateFileUpload,
  validateUpdateJob,
  updateJob
);
router.delete(
  '/:id', 
  authorize('company', 'admin'),
  checkJobOwnership,
  deleteJob
);
// Job photo upload
router.put(
  '/:id/photo', 
  authorize('company'),
  checkJobOwnership,
  jobPhotoUpload
);
// Close job
router.put('/:id/close', 
  authorize('company'),
  checkJobOwnership,
  closeJob
);
// Admin routes (only accessible by admins)
router.use(authorize('admin'));
// Add any admin-specific job routes here
module.exports = router;
