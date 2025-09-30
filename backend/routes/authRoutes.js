const express = require('express');
const {
  registerIntern,
  registerCompany,
  loginIntern,
  loginCompany,
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
router.post('/register/intern', registerIntern);
router.post('/register/company', registerCompany);
// --- LOGIN ROUTES ---
router.post('/login/intern', loginIntern);
router.post('/login/company', loginCompany);
// --- PASSWORD RESET ROUTES ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
// --- PROTECTED ROUTES ---
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
module.exports = router;
