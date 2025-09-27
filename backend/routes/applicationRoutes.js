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
  checkApplicationAccess
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Apply protect middleware to all routes
router.use(protect);

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job to apply for
 *               coverLetter:
 *                 type: string
 *                 description: Optional cover letter
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: Invalid input or already applied
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (interns only)
 */
router.post('/', authorize('intern'), createApplication);

/**
 * @swagger
 * /applications/company:
 *   get:
 *     summary: Get all applications for company's listings
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves all applications for listings created by the company
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 */
router.get('/company', authorize('company'), getCompanyApplications);

/**
 * @swagger
 * /applications/me:
 *   get:
 *     summary: Get all applications for the logged-in intern
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (interns only)
 */
router.get('/me', authorize('intern'), getMyApplications);

/**
 * @swagger
 * /applications/stats/company:
 *   get:
 *     summary: Get application statistics for the company
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved application statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 */
router.get('/stats/company', authorize('company'), getCompanyApplicationStats);

/**
 * @swagger
 * /applications/stats/me:
 *   get:
 *     summary: Get application statistics for the logged-in intern
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved application statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (interns only)
 */
router.get('/stats/me', authorize('intern'), getMyApplicationStats);

// Apply checkApplicationAccess middleware to routes with :id parameter
router.use('/:id', checkApplicationAccess);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get a single application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Successfully retrieved application
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this application
 *       404:
 *         description: Application not found
 */
router.get('/:id', getApplication);

/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
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
 *                 enum: [applied, reviewed, interviewing, shortlisted, offered, hired, rejected, withdrawn]
 *                 description: New status of the application
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this application
 *       404:
 *         description: Application not found
 */
router.put('/:id/status', authorize('company'), updateApplicationStatus);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Delete an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this application
 *       404:
 *         description: Application not found
 */
router.delete('/:id', deleteApplication);

module.exports = router;
 *     summary: Get all applications for the logged-in intern
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves all applications submitted by the current intern
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (intern only)
 */
router.get("/interns", protect, authorize("intern"), getMyApplications);

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     description: Submit a new application for an internship listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listing
 *               - coverLetter
 *             properties:
 *               listing:
 *                 type: string
 *                 description: ID of the listing to apply for
 *               coverLetter:
 *                 type: string
 *                 description: Cover letter for the application
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Bad Request (e.g., already applied to this listing)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (intern only)
 *       404:
 *         description: Listing not found
 */
router.route("/")
  .post(protect, authorize("intern"), createApplication);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Successfully retrieved application
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this application
 *       404:
 *         description: Application not found
 */
router.route("/:id")
  .get(protect, getApplicationById);

/**
 * @swagger
 * /applications/job/{jobId}:
 *   get:
 *     summary: Get applications by job ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job/Listing ID
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 *       404:
 *         description: Job not found
 */
router.route("/job/:jobId")
  .get(protect, authorize("company"), getApplicationsByJobId);

/**
 * @swagger
 * /applications/precheck/{jobId}:
 *   get:
 *     summary: Check if user has already applied to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job/Listing ID to check
 *     responses:
 *       200:
 *         description: Successfully checked application status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (intern only)
 *       404:
 *         description: Job not found
 */
router.route("/precheck/:jobId")
  .get(protect, preCheckJob);

/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
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
 *                 enum: [pending, reviewed, accepted, rejected]
 *                 description: New status of the application
 *     responses:
 *       200:
 *         description: Successfully updated application status
 *       400:
 *         description: Invalid status provided
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 *       404:
 *         description: Application not found
 */
/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
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
 *                 enum: [pending, reviewed, accepted, rejected]
 *                 description: New status of the application
 *     responses:
 *       200:
 *         description: Successfully updated application status
 *       400:
 *         description: Invalid status provided
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 *       404:
 *         description: Application not found
 */
router.route("/:id/status")
  .put(protect, authorize("company"), updateApplicationStatus);

// Export the router
module.exports = router;
