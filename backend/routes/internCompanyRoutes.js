const express = require('express');
const {
  getInternCompanies,
  getInternStats,
  getCompanyRelationship
} = require('../controllers/internCompanyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();
// Protect all routes with authentication
router.use(protect);
router.get('/', authorize('intern'), getInternCompanies);
router.get('/stats', authorize('intern'), getInternStats);
router.get('/:companyId', authorize('intern'), getCompanyRelationship);
module.exports = router;
