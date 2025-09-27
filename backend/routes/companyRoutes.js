const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyById,
  getCompanies,
  uploadCompanyLogo,
  uploadCompanyCover,
  getCompanyStats
} = require('../controllers/companyController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management and retrieval
 */

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Protected routes (require authentication)
router.use(protect);

// Company-specific routes (require company role)
router.get('/me', authorize('company'), getCompanyProfile);
router.put('/me', authorize('company'), updateCompanyProfile);

/**
 * @swagger
 * /companies/me/logo:
 *   put:
 *     summary: Upload company logo
 *     tags: [Companies]
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
 *                 description: The image file to upload as logo
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Please upload a file
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 */
router.put('/me/logo', authorize('company'), uploadCompanyLogo);

/**
 * @swagger
 * /companies/me/cover:
 *   put:
 *     summary: Upload company cover photo
 *     tags: [Companies]
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
 *                 description: The image file to upload as cover photo
 *     responses:
 *       200:
 *         description: Cover photo uploaded successfully
 *       400:
 *         description: Please upload a file
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (company only)
 */
router.put('/me/cover', authorize('company'), uploadCompanyCover);

// Admin routes (only accessible by admins)
router.use(authorize('admin'));

/**
 * @swagger
 * /companies/stats:
 *   get:
 *     summary: Get company statistics (Admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved company statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get('/stats', getCompanyStats);

module.exports = router;

router.put('/profile', protect, authorize('company'), updateCompanyProfile);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
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
 *         description: Successfully retrieved companies
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
 *                     $ref: '#/components/schemas/Company'
 */
router.get('/', getCompanies);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Successfully retrieved company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 */
router.get('/:id', getCompanyById);

module.exports = router;
