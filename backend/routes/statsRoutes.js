const express = require('express');
const {
  getApplicationStats,
  getInterviewStats,
  getDashboardStats
} = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/applications', protect, getApplicationStats);
router.get('/interviews', protect, getInterviewStats);
router.get('/dashboard', protect, getDashboardStats);
module.exports = router;
