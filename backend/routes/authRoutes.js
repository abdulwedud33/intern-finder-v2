const express = require('express');
const {
  registerIntern,
  registerCompany,
  loginIntern,
  loginCompany,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */

// --- REGISTRATION ROUTES ---

/**
 * @swagger
 * /api/auth/register/intern:
 *   post:
 *     summary: Register a new intern
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - internshipType
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Intern"
 *               email:
 *                 type: string
 *                 example: "john.intern@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "123-456-7890"
 *               internshipType:
 *                 type: string
 *                 enum: [free, paid]
 *                 example: "paid"
 *     responses:
 *       201:
 *         description: Intern registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 role:
 *                   type: string
 *                   example: "intern"
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register/intern', registerIntern);

/**
 * @swagger
 * /api/auth/register/company:
 *   post:
 *     summary: Register a new company
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech Solutions Inc."
 *               email:
 *                 type: string
 *                 example: "contact@techsolutions.com"
 *               password:
 *                 type: string
 *                 example: "securepassword456"
 *               phone:
 *                 type: string
 *                 example: "987-654-3210"
 *     responses:
 *       201:
 *         description: Company registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 role:
 *                   type: string
 *                   example: "company"
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439012"
 *       400:
 *         description: Invalid input or company already exists
 */
router.post('/register/company', registerCompany);

// --- LOGIN ROUTES ---

/**
 * @swagger
 * /api/auth/login/intern:
 *   post:
 *     summary: Login for interns
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "intern@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 role:
 *                   type: string
 *                   example: "intern"
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Please provide email and password
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Not authorized to access this route
 */
router.post('/login/intern', loginIntern);

/**
 * @swagger
 * /api/auth/login/company:
 *   post:
 *     summary: Login for companies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "company@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 role:
 *                   type: string
 *                   example: "company"
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439012"
 *       400:
 *         description: Please provide email and password
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Not authorized to access this route
 */
router.post('/login/company', loginCompany);

// --- PASSWORD RESET ROUTES ---

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email sent with reset token
 *       404:
 *         description: No user with that email
 */
router.post('/forgotpassword', forgotPassword);

/**
 * @swagger
 * /api/auth/resetpassword/{resettoken}:
 *   put:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resettoken
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token
 */
router.put('/resetpassword/:resettoken', resetPassword);

// --- PROTECTED ROUTES ---

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout user / clear cookie
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *                 id:
 *                   type: string
 *       401:
 *         description: Not authorized to access this route
 */
router.use(protect);

router.get('/me', getMe);
router.get('/logout', logout);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

module.exports = router;
