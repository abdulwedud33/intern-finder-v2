const express = require('express');
const { 
  getUsers,
  searchCompanies 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);

// Public search route
router.get('/search/companies', searchCompanies);

module.exports = router;
