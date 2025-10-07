const express = require('express');
const {
  registerIntern,
  registerCompany,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadSingle } = require('../middleware/upload');
const router = express.Router();
// --- REGISTRATION ROUTES ---
router.post('/register/intern', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), registerIntern);
router.post('/register/company', uploadSingle('logo'), registerCompany);
// --- LOGIN ROUTES ---
router.post('/login', login); // Unified login endpoint for both intern and company
// --- PASSWORD RESET ROUTES ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
// --- PROTECTED ROUTES ---
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
module.exports = router;
