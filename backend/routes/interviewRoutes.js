const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  scheduleInterview,
  getCompanyInterviews,
  getCompanyInterviewsById,
  getMyInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
  submitFeedback
} = require('../controllers/interviewController');

const router = express.Router({ mergeParams: true });

// Apply authentication to all routes
router.use(protect);

// Debug middleware for company route
router.get('/company', (req, res, next) => {
  console.log('=== /company route hit ===');
  console.log('User:', req.user);
  next();
}, authorize('company'), getCompanyInterviews);
router.get('/companies/:companyId/interviews', authorize('company', 'admin'), getCompanyInterviewsById);

// Intern routes
router.get('/me', authorize('intern'), getMyInterviews);

// General routes
router.get('/:id', getInterview);
router.post('/', authorize('company'), scheduleInterview);
router.put('/:id', updateInterview);
router.delete('/:id', authorize('company'), deleteInterview);

module.exports = router;
