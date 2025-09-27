const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  scheduleInterview,
  getCompanyInterviews,
  getMyInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
  submitFeedback
} = require('../controllers/interviewController');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Interview:
 *       type: object
 *       required:
 *         - applicationId
 *         - date
 *         - time
 *         - interviewType
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the interview
 *         application:
 *           $ref: '#/components/schemas/Application'
 *         company:
 *           $ref: '#/components/schemas/Company'
 *         intern:
 *           $ref: '#/components/schemas/Intern'
 *         job:
 *           $ref: '#/components/schemas/Job'
 *         date:
 *           type: string
 *           format: date
 *           description: Interview date (YYYY-MM-DD)
 *         time:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$
 *           description: Interview time in 24-hour format (HH:MM)
 *         location:
 *           type: string
 *           description: Interview location (for in-person interviews)
 *         notes:
 *           type: string
 *           description: Additional notes about the interview
 *         interviewType:
 *           type: string
 *           enum: [virtual, in_person, phone]
 *           default: virtual
 *           description: Type of interview
 *         status:
 *           type: string
 *           enum: [scheduled, rescheduled, in_progress, completed, cancelled]
 *           default: scheduled
 *           description: Current status of the interview
 *         feedback:
 *           type: object
 *           properties:
 *             rating:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *               description: Rating from 1 to 5
 *             notes:
 *               type: string
 *               description: Detailed feedback notes
 *             strengths:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of candidate's strengths
 *             areasForImprovement:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of areas for improvement
 *             recommendation:
 *               type: string
 *               enum: [hire, no_hire, strong_hire, strong_no_hire, not_sure]
 *               description: Hiring recommendation
 *             submittedBy:
 *               type: string
 *               format: uuid
 *               description: ID of the user who submitted the feedback
 *             submittedAt:
 *               type: string
 *               format: date-time
 *               description: When the feedback was submitted
 *         scheduledBy:
 *           type: string
 *           format: uuid
 *           description: ID of the user who scheduled the interview
 *         cancelledBy:
 *           type: string
 *           format: uuid
 *           description: ID of the user who cancelled the interview
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: When the interview was cancelled
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: When the interview was started
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the interview was completed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the interview was scheduled
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the interview was last updated
 * 
 *     InterviewInput:
 *       type: object
 *       required:
 *         - applicationId
 *         - date
 *         - time
 *         - interviewType
 *       properties:
 *         applicationId:
 *           type: string
 *           format: uuid
 *           description: ID of the application
 *         date:
 *           type: string
 *           format: date
 *           description: Interview date (YYYY-MM-DD)
 *         time:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$
 *           description: Interview time in 24-hour format (HH:MM)
 *         location:
 *           type: string
 *           description: Interview location (for in-person interviews)
 *         notes:
 *           type: string
 *           description: Additional notes about the interview
 *         interviewType:
 *           type: string
 *           enum: [virtual, in_person, phone]
 *           default: virtual
 *           description: Type of interview
 * 
 *     InterviewFeedback:
 *       type: object
 *       required:
 *         - rating
 *         - notes
 *         - strengths
 *         - areasForImprovement
 *         - recommendation
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5
 *         notes:
 *           type: string
 *           description: Detailed feedback notes
 *         strengths:
 *           type: array
 *           items:
 *             type: string
 *           description: List of candidate's strengths
 *         areasForImprovement:
 *           type: array
 *           items:
 *             type: string
 *           description: List of areas for improvement
 *         recommendation:
 *           type: string
 *           enum: [hire, no_hire, strong_hire, strong_no_hire, not_sure]
 *           description: Hiring recommendation
 * 
 * tags:
 *   - name: Interviews
 *     description: Interview scheduling and management
 */

// Public routes (none)

/**
 * @swagger
 * /api/v1/companies/{companyId}/interviews:
 *   get:
 *     summary: Get all interviews for a company
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: List of company interviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Interview'
 */
router.get('/companies/:companyId/interviews', 
  protect, 
  authorize('company', 'admin'), 
  getCompanyInterviews
);

// Protected routes (require authentication)
router.use(protect);

/**
 * @swagger
 * /api/v1/interviews/company:
 *   get:
 *     summary: Get all interviews for the current company
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved company interviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interview'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 */
router.get('/company', authorize('company'), getCompanyInterviews);

/**
 * @swagger
 * /api/v1/interviews/me:
 *   get:
 *     summary: Get all interviews for the current intern
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved intern interviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interview'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (intern only)
 */
router.get('/me', authorize('intern'), getMyInterviews);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Successfully retrieved interview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interview'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this interview
 *       404:
 *         description: Interview not found
 */
router.get('/:id', getInterview);

/**
 * @swagger
 * /api/v1/interviews:
 *   post:
 *     summary: Schedule a new interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewInput'
 *     responses:
 *       201:
 *         description: Interview scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interview'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 *       404:
 *         description: Application not found
 */
router.post('/', authorize('company'), scheduleInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   put:
 *     summary: Update interview details
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewInput'
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interview'
 *       400:
 *         description: Invalid input data or invalid status transition
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this interview
 *       404:
 *         description: Interview not found
 */
router.put('/:id', updateInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   delete:
 *     summary: Delete an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this interview
 *       404:
 *         description: Interview not found
 */
router.delete('/:id', deleteInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/feedback:
 *   post:
 *     summary: Submit interview feedback
 *     description: Submit feedback for a completed interview (company only)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewFeedback'
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interview'
 *       400:
 *         description: Invalid input data or feedback already submitted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to submit feedback for this interview
 *       404:
 *         description: Interview not found
 *       409:
 *         description: Interview not in a completed state
 */
/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   put:
 *     summary: Reschedule an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - time
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: New interview date (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 description: New interview time (HH:MM)
 *               location:
 *                 type: string
 *                 description: New interview location or meeting link
 *               notes:
 *                 type: string
 *                 description: Additional notes about the reschedule
 *     responses:
 *       200:
 *         description: Interview rescheduled successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to reschedule this interview
 *       404:
 *         description: Interview not found
 */
/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   put:
 *     summary: Update an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, rescheduled]
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this interview
 *       404:
 *         description: Interview not found
 */
/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   put:
 *     summary: Update an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, rescheduled]
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this interview
 *       404:
 *         description: Interview not found
 */
/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   put:
 *     summary: Update an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, rescheduled]
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this interview
 *       404:
 *         description: Interview not found
 */
router.put('/:id', updateInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/feedback:
 *   post:
 *     summary: Submit interview feedback (company only)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewFeedback'
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid feedback data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to submit feedback for this interview
 *       404:
 *         description: Interview not found
 *       409:
 *         description: Interview not in a completed state
 */
/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   delete:
 *     summary: Delete an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 *       404:
 *         description: Interview not found
 */
router.delete('/:id', authorize('company'), deleteInterview);

module.exports = router;
