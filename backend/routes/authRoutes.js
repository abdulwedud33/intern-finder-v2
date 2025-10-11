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
const router = express.Router();
// --- REGISTRATION ROUTES ---
// Note: Registration now uses Cloudinary URLs sent in request body, no file upload middleware needed
router.post('/register/intern', registerIntern);
router.post('/register/company', registerCompany);
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
