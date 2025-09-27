const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getInternProfile,
  updateInternProfile,
  getInternById,
  getInterns,
  uploadProfilePicture,
  uploadResume,
  getInternStats
} = require('../controllers/internController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Interns
 *   description: Intern profile management and retrieval
 */

// Public routes
router.get('/', getInterns);
router.get('/:id', getInternById);

// Protected routes (require authentication)
router.use(protect);

// Intern-specific routes (require intern role)
router.get('/me', authorize('intern'), getInternProfile);
router.put('/me', authorize('intern'), updateInternProfile);

/**
 * @swagger
 * /interns/me/photo:
 *   put:
 *     summary: Upload intern profile picture
 *     tags: [Interns]
 *     security:
 *       - bearerAuth: []
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
 *                 description: The image file to upload as profile picture
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Please upload a file
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (intern only)
 */
router.put('/me/photo', authorize('intern'), uploadProfilePicture);

/**
 * @swagger
 * /interns/me/resume:
 *   put:
 *     summary: Upload intern resume
 *     tags: [Interns]
 *     security:
 *       - bearerAuth: []
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
 *                 description: The PDF file to upload as resume
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Please upload a PDF file
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (intern only)
 */
router.put('/me/resume', authorize('intern'), uploadResume);

// Admin routes (only accessible by admins)
router.use(authorize('admin'));

/**
 * @swagger
 * /interns/stats:
 *   get:
 *     summary: Get intern statistics (Admin only)
 *     tags: [Interns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved intern statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get('/stats', getInternStats);

module.exports = router;
 
router.put('/profile', protect, authorize('intern'), updateInternProfile);

/**
 * @swagger
 * /interns:
 *   get:
 *     summary: Get all interns
 *     tags: [Interns]
 *     parameters:
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select (comma-separated)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by fields (prefix with - for descending)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved interns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Intern'
 */
router.get('/', getInterns);

/**
 * @swagger
 * /interns/{id}:
 *   get:
 *     summary: Get intern by ID
 *     tags: [Interns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Intern ID
 *     responses:
 *       200:
 *         description: Successfully retrieved intern
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Intern'
 *       404:
 *         description: Intern not found
 */
router.get('/:id', getInternById);

module.exports = router;
