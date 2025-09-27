const express = require('express');
const { getUsers } = require('../controllers/userController');
const { searchCompanies } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and search
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (both interns and companies)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     interns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Intern'
 *                     companies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 *                     total:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Not authorized to access this route
 *       403:
 *         description: Not authorized to access this resource
 */
router.get('/', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/companies/search:
 *   get:
 *     summary: Search companies by name
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Company name to search for
 *     responses:
 *       200:
 *         description: Successfully found companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       400:
 *         description: Please provide a company name to search for
 */
router.get('/companies/search', searchCompanies);

module.exports = router;
