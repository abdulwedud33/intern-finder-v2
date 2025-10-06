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

// Company routes
router.get('/company', authorize('company'), getCompanyInterviews);
router.get('/companies/:companyId/interviews', authorize('company', 'admin'), getCompanyInterviewsById);

// Intern routes
router.get('/me', authorize('intern'), getMyInterviews);

// General routes
router.get('/:id', getInterview);
router.post('/', authorize('company'), scheduleInterview);
router.put('/:id', updateInterview);
router.delete('/:id', authorize('company'), deleteInterview);

module.exports = router;
