const express = require('express');
const { 
  getUsers,
  searchCompanies,
  getUsersCount
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);

// Public routes
router.get('/search/companies', searchCompanies);
router.get('/count', getUsersCount);

module.exports = router;
