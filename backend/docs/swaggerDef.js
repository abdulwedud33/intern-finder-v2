/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         password:
 *           type: string
 *           format: password
 *           description: The password of the user (hashed)
 *         role:
 *           type: string
 *           enum: [intern, company, admin]
 *           description: The role of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         avatar:
 *           type: string
 *           description: URL to the user's avatar image
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the user account is active
 *         lastActive:
 *           type: string
 *           format: date-time
 *           description: When the user was last active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *     Intern:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             dateOfBirth:
 *               type: string
 *               format: date
 *               description: The intern's date of birth
 *             gender:
 *               type: string
 *               enum: [male, female, other, prefer not to say]
 *               description: The intern's gender
 *             education:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   institution:
 *                     type: string
 *                   degree:
 *                     type: string
 *                   fieldOfStudy:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   current:
 *                     type: boolean
 *                     default: false
 *             skills:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of skills the intern has
 *             experience:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   company:
 *                     type: string
 *                   location:
 *                     type: string
 *                   from:
 *                     type: string
 *                     format: date
 *                   to:
 *                     type: string
 *                     format: date
 *                   current:
 *                     type: boolean
 *                     default: false
 *                   description:
 *                     type: string
 *     Company:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             companyName:
 *               type: string
 *               description: The name of the company
 *             industry:
 *               type: string
 *               description: The industry the company operates in
 *             description:
 *               type: string
 *               description: A description of the company
 *             website:
 *               type: string
 *               format: uri
 *               description: The company's website URL
 *             companySize:
 *               type: string
 *               enum: [1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001+]
 *               description: The size range of the company
 *             foundedYear:
 *               type: number
 *               description: The year the company was founded
 *             logo:
 *               type: string
 *               description: URL to the company's logo
 *             coverImage:
 *               type: string
 *               description: URL to the company's cover image
 *             socialMedia:
 *               type: object
 *               properties:
 *                 linkedin:
 *                   type: string
 *                 twitter:
 *                   type: string
 *                 facebook:
 *                   type: string
 *                 instagram:
 *                   type: string
 *                 github:
 *                   type: string
 *                 youtube:
 *                   type: string
 *                 website:
 *                   type: string
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: object
 *           description: Additional error details (development only)
 *   parameters:
 *     userIdParam:
 *       in: path
 *       name: userId
 *       required: true
 *       schema:
 *         type: string
 *       description: User ID
 *     jobIdParam:
 *       in: path
 *       name: jobId
 *       required: true
 *       schema:
 *         type: string
 *       description: Job ID
 *     applicationIdParam:
 *       in: path
 *       name: applicationId
 *       required: true
 *       schema:
 *         type: string
 *       description: Application ID
 *     reviewIdParam:
 *       in: path
 *       name: reviewId
 *       required: true
 *       schema:
 *         type: string
 *       description: Review ID
 *   responses:
 *     UnauthorizedError:
 *       description: Unauthorized / Not authenticated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     ForbiddenError:
 *       description: Forbidden / Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *   security:
 *     - bearerAuth: []
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and authorization
 *   - name: Users
 *     description: User management
 *   - name: Interns
 *     description: Intern profiles and management
 *   - name: Companies
 *     description: Company profiles and management
 *   - name: Jobs
 *     description: Job postings and applications
 *   - name: Applications
 *     description: Job applications
 *   - name: Interviews
 *     description: Interview scheduling and management
 *   - name: Reviews
 *     description: Company and intern reviews
 *   - name: Stats
 *     description: Application statistics and analytics
 */

// Security definitions for Swagger
const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
};

// Export the Swagger definition
export default {
  openapi: '3.0.0',
  info: {
    title: 'Intern Finder API',
    version: '1.0.0',
    description: 'API for Intern Finder - Connecting companies with talented interns',
    contact: {
      name: 'API Support',
      email: 'support@internfinder.com',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:5000/api/v1',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes,
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};
