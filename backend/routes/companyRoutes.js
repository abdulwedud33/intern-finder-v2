const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyById,
  getCompanies,
  // uploadCompanyLogo,
  // uploadCompanyCover,
  // getCompanyStats
} = require('../controllers/companyController');
const router = express.Router();
// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
// Protected routes (require authentication)
router.use(protect);
// Company-specific routes (require company role)
router.get('/me', authorize('company'), getCompanyProfile);
router.put('/me', authorize('company'), updateCompanyProfile);
// Upload routes (commented out for now)
// router.put('/me/logo', authorize('company'), uploadCompanyLogo);
// router.put('/me/cover', authorize('company'), uploadCompanyCover);
// router.get('/me/stats', authorize('company'), getCompanyStats);
// Admin routes (only accessible by admins)
router.use(authorize('admin'));
module.exports = router;
