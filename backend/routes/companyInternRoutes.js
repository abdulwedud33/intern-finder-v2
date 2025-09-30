const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getCompanyInterns,
  getCompanyInternStats,
  searchCompanyInterns,
  getCompanyInternById,
  updateCompanyInternStatus,
  terminateCompanyIntern
} = require('../controllers/companyInternController');
const router = express.Router({ mergeParams: true });
// Protect all routes with company authentication
router.use(protect);
router.use(authorize('company', 'admin'));
router.get('/', getCompanyInterns);
router.get('/stats', getCompanyInternStats);
router.get('/search', searchCompanyInterns);
router.get('/:internId', getCompanyInternById);
router.put('/:internId/status', updateCompanyInternStatus);
router.put('/:internId/terminate', terminateCompanyIntern);
module.exports = router;
