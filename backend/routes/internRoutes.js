const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getInternProfile,
  updateInternProfile,
  getInternById,
  getInterns,
  uploadProfilePicture,
  uploadResume,
  getInternStats
} = require('../controllers/internController');

const router = express.Router();

// Public routes
router.get('/', getInterns);
router.get('/:id', getInternById);

// Protected routes (require authentication)
router.use(protect);

// Intern-specific routes (require intern role)
router.get('/me', authorize('intern'), getInternProfile);
router.put('/me', authorize('intern'), updateInternProfile);
router.put('/me/photo', authorize('intern'), uploadProfilePicture);
router.put('/me/resume', authorize('intern'), uploadResume);

// Admin routes (only accessible by admins)
router.use(authorize('admin'));
router.get('/stats', getInternStats);

module.exports = router;
