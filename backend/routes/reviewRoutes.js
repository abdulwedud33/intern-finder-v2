const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getReviewsForTarget,
  getMyReviews,
  getReviewsAboutMe,
  createOrUpdateInternReview,
  getCompanyInternReviews,
  createOrUpdateCompanyReview
} = require('../controllers/reviewController');
const router = express.Router();
// Public routes
router.get('/', getReviews);
router.get('/target/:targetId', getReviewsForTarget);

// Protected routes (require authentication)
router.use(protect);

// Routes for authenticated users - specific routes first
router.get('/about-me', getReviewsAboutMe);
router.get('/me', getMyReviews);

// General routes
router.get('/:id', getReview);
router.post('/', authorize('intern', 'company'), createReview);
router.put('/:id', authorize('intern', 'company'), updateReview);
router.delete('/:id', authorize('intern', 'company', 'admin'), deleteReview);
// Company to Intern Reviews
router.post(
  '/intern-reviews/:internId/:jobId',
  protect,
  authorize('company'),
  createOrUpdateInternReview
);
router.get(
  '/intern-reviews',
  protect,
  authorize('company'),
  getCompanyInternReviews
);
// Intern to Company Reviews
router.post(
  '/company-reviews/:companyId',
  protect,
  authorize('intern'),
  createOrUpdateCompanyReview
);
module.exports = router;
