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
  getCompanyJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { 
  validateCreateJob, 
  validateUpdateJob, 
  checkJobOwnership,
  validateFileUpload 
} = require('../middleware/validators/jobValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - requirements
 *         - responsibilities
 *         - type
 *         - location
 *         - salary
 *         - duration
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the job
 *         title:
 *           type: string
 *           description: The job title
 *         description:
 *           type: string
 *           description: Detailed job description
 *         requirements:
 *           type: string
 *           description: Job requirements
 *         responsibilities:
 *           type: string
 *           description: Job responsibilities
 *         type:
 *           type: string
 *           enum: [Full-time, Part-time, Contract, Internship, Temporary]
 *         location:
 *           type: string
 *           description: Job location
 *         salary:
 *           type: string
 *           description: Salary or pay range
 *         duration:
 *           type: string
 *           description: Job duration (for temporary/contract positions)
 *         isRemote:
 *           type: boolean
 *           default: false
 *         status:
 *           type: string
 *           enum: [open, closed, draft]
 *           default: 'draft'
 *         company:
 *           type: string
 *           description: Reference to the Company model
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Public routes
router.get('/', getJobs);
router.get('/detail/:id', getJob);

// Protected routes (require authentication)
router.use(protect);

// Company routes
router.get('/company', authorize('company'), getCompanyJobs);

/**
 * @swagger
 * /jobs/radius/{zipcode}/{distance}:
 *   get:
 *     summary: Get jobs within a radius
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: zipcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Zipcode to search from
 *       - in: path
 *         name: distance
 *         required: true
 *         schema:
 *           type: number
 *         description: Distance in miles
 *     responses:
 *       200:
 *         description: Successfully retrieved jobs
 */
router.get('/radius/:zipcode/:distance', getJobsInRadius);

// Protected routes (require authentication)
router.use(protect);

// Company routes (continued)
router.post(
  '/create',
  protect,
  authorize('company'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalFiles', maxCount: 5 }
  ]),
  validateFileUpload,
  validateCreateJob,
  createJob
);

router.put(
  '/update/:id',
  protect,
  authorize('company'),
  checkJobOwnership,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalFiles', maxCount: 5 }
  ]),
  validateFileUpload,
  validateUpdateJob,
  updateJob
);

router.put(
  '/delete/:id', 
  protect,
  authorize('company', 'admin'),
  checkJobOwnership,
  deleteJob
);

// Upload photo for job
router.put(
  '/:id/photo', 
  protect,
  authorize('company'),
  checkJobOwnership,
  upload.single('photo'),
  jobPhotoUpload
);

/**
 * @swagger
 * /jobs/stats/company:
 *   get:
 *     summary: Get job statistics for the company
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved job statistics
 *       403:
 *         description: Not authorized to view job statistics
 */
router.get('/stats/company', authorize('company'), getJobStats);

/**
 * @swagger
 * /jobs/{id}/photo:
 *   put:
 *     summary: Upload job photo
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Please upload a file
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this job
 */
router.put('/:id/photo', authorize('company'), jobPhotoUpload);

/**
 * @swagger
 * /jobs/{id}/close:
 *   put:
 *     summary: Close a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to close
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [filled, closed]
 *                 description: The status to set when closing the job
 *     responses:
 *       200:
 *         description: Job closed successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to close this job
 *       404:
 *         description: Job not found
 */
router.put('/:id/close', authorize('company'), closeJob);

// Admin routes (only accessible by admins)
router.use(authorize('admin'));

// Add any admin-specific job routes here

module.exports = router;
 
router.route('/')
  .get(getJobs)
  .post(protect, authorize('company'), createJob);

/**
 * @swagger
 * /jobs/search:
 *   get:
 *     summary: Search jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */
router.get('/search', searchJobs);

/**
 * @swagger
 * /jobs/company/{companyId}:
 *   get:
 *     summary: Get jobs by company
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: List of jobs for the company
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */
router.get('/company/:companyId', getJobsByCompany);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a single job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Updated job
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 */
router.route('/:id')
  .get(getJob)
  .put(protect, authorize('company'), updateJob)
  .delete(protect, authorize('company'), deleteJob);

module.exports = router;
