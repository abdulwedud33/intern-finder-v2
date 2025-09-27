const express = require('express');
const {
  getApplicationStats,
  getInterviewStats,
  getDashboardStats
} = require('../controllers/statsController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Application and interview statistics
 */

/**
 * @swagger
 * /stats/applications:
 *   get:
 *     summary: Get application statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved application statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: number
 *                       avgResponseDays:
 *                         type: number
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view these stats
 */
router.get('/applications', protect, getApplicationStats);

/**
 * @swagger
 * /stats/interviews:
 *   get:
 *     summary: Get interview statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved interview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: number
 *                       avgScheduledDays:
 *                         type: number
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view these stats
 */
router.get('/interviews', protect, getInterviewStats);

/**
 * @swagger
 * /stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard statistics
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
 *                     applications:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         reviewed:
 *                           type: number
 *                         accepted:
 *                           type: number
 *                         rejected:
 *                           type: number
 *                     interviews:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         scheduled:
 *                           type: number
 *                         completed:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *                     recentApplications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     upcomingInterviews:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view these stats
 */
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
