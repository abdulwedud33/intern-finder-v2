const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getCompanyInterns,
  getCompanyInternStats,
  searchCompanyInterns,
  getCompanyInternById,
  updateCompanyInternStatus,
  terminateCompanyIntern
} = require('../controllers/companyInternController');

const router = express.Router({ mergeParams: true });

// Protect all routes with company authentication
router.use(protect);
router.use(authorize('company', 'admin'));

/**
 * @swagger
 * tags:
 *   name: Company Interns
 *   description: Company intern management
 */

/**
 * @swagger
 * /api/company-interns:
 *   get:
 *     summary: Get all company interns
 *     tags: [Company Interns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of company interns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CompanyIntern'
 */
router.get('/', getCompanyInterns);

/**
 * @swagger
 * /api/company-interns/stats:
 *   get:
 *     summary: Get company intern statistics
 *     tags: [Company Interns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company intern statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInterns:
 *                   type: number
 *                 activeInterns:
 *                   type: number
 *                 terminatedInterns:
 *                   type: number
 */
router.get('/stats', getCompanyInternStats);

/**
 * @swagger
 * /api/company-interns/search:
 *   get:
 *     summary: Search and filter company interns
 *     tags: [Company Interns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, terminated]
 *         description: Filter by intern status
 *     responses:
 *       200:
 *         description: List of filtered company interns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CompanyIntern'
 */
router.get('/search', searchCompanyInterns);

/**
 * @swagger
 * /api/company-interns/{internId}:
 *   get:
 *     summary: Get company intern by ID
 *     tags: [Company Interns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company intern relationship ID
 *     responses:
 *       200:
 *         description: Company intern details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyIntern'
 */
router.get('/:internId', getCompanyInternById);

/**
 * @swagger
 * /api/company-interns/{internId}/status:
 *   put:
 *     summary: Update company intern status
 *     tags: [Company Interns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company intern relationship ID
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
 *                 enum: [active, terminated]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Company intern status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyIntern'
 */
router.put('/:internId/status', updateCompanyInternStatus);

/**
 * @swagger
 * /api/company-interns/{internId}/terminate:
 *   put:
 *     summary: Terminate company intern
 *     tags: [Company Interns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company intern relationship ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Intern terminated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyIntern'
 */
router.put('/:internId/terminate', terminateCompanyIntern);

module.exports = router;
