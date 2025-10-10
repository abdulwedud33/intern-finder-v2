const express = require('express');
const {
  getInternCompanies,
  getInternStats,
  getCompanyRelationship,
  getWorkHistoryTimeline,
  getAchievements,
  getSkillsGained,
  getPerformanceHistory,
  getRecommendations
} = require('../controllers/internCompanyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();
// Protect all routes with authentication
router.use(protect);

// Specific routes first (to avoid conflicts with /:companyId)
router.get('/stats', authorize('intern'), getInternStats);
router.get('/timeline', authorize('intern'), getWorkHistoryTimeline);
router.get('/achievements', authorize('intern'), getAchievements);
router.get('/skills', authorize('intern'), getSkillsGained);
router.get('/performance', authorize('intern'), getPerformanceHistory);
router.get('/recommendations', authorize('intern'), getRecommendations);

// General routes
router.get('/', authorize('intern'), getInternCompanies);
router.get('/:companyId', authorize('intern'), getCompanyRelationship);
module.exports = router;
