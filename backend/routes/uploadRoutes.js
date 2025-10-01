const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  uploadResume,
  uploadProfilePhoto,
  uploadCompanyLogo,
  uploadJobPhoto,
  deleteFile
} = require('../controllers/uploadController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Resume upload (for interns)
router.post('/resume', authorize('intern'), uploadResume);

// Profile photo upload (for interns)
router.post('/profile-photo', authorize('intern'), uploadProfilePhoto);

// Company logo upload (for companies)
router.post('/company-logo', authorize('company'), uploadCompanyLogo);

// Job photo upload (for companies)
router.post('/job-photo', authorize('company'), uploadJobPhoto);

// Delete file
router.delete('/delete', deleteFile);

module.exports = router;
