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

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management and retrieval
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - rating
 *         - comment
 *         - target
 *         - job
 *         - reviewType
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the review
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5
 *         comment:
 *           type: string
 *           description: Review comment
 *         reviewer:
 *           type: string
 *           description: ID of the user who wrote the review
 *         target:
 *           type: string
 *           description: ID of the user being reviewed
 *         job:
 *           type: string
 *           description: ID of the job related to the review
 *         reviewType:
 *           type: string
 *           enum: [company, intern]
 *           description: Type of review (company or intern)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the review was created
 */

// Public routes
router.get('/', getReviews);
router.get('/target/:targetId', getReviewsForTarget);
router.get('/:id', getReview);

// Protected routes (require authentication)
router.use(protect);

// Routes for authenticated users
router.get('/me/reviews', getMyReviews);
router.get('/me/received', getReviewsAboutMe);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to create this review
 */
router.post('/', authorize('intern', 'company'), createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this review
 *       404:
 *         description: Review not found
 */
router.put('/:id', authorize('intern', 'company'), updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this review
 *       404:
 *         description: Review not found
 */
router.delete('/:id', authorize('intern', 'company', 'admin'), deleteReview);

router.get('/about-me', protect, getReviewsAboutMe);

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
