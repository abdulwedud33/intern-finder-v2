const express = require('express');
const {
  getInternCompanies,
  getInternStats,
  getCompanyRelationship
} = require('../controllers/internCompanyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Intern Companies
 *   description: Manage companies that an intern has worked with
 */

// Protect all routes with authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/intern-companies:
 *   get:
 *     summary: Get all companies the intern has worked with
 *     tags: [Intern Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies
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
 *                     $ref: '#/components/schemas/CompanyIntern'
 *       401:
 *         description: Not authenticated
 */
router.get('/', authorize('intern'), getInternCompanies);

/**
 * @swagger
 * /api/v1/intern-companies/stats:
 *   get:
 *     summary: Get intern's statistics
 *     tags: [Intern Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Intern statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCompanies:
 *                       type: integer
 *                     activeCompanies:
 *                       type: integer
 *                     terminatedCompanies:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *       401:
 *         description: Not authenticated
 */
router.get('/stats', authorize('intern'), getInternStats);

/**
 * @swagger
 * /api/v1/intern-companies/{companyId}:
 *   get:
 *     summary: Get details of a specific company relationship
 *     tags: [Intern Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company relationship details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CompanyIntern'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: No relationship found with the company
 */
router.get('/:companyId', authorize('intern'), getCompanyRelationship);

module.exports = router;
