const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadAvatarMiddleware,
  uploadLogoMiddleware,
  uploadResumeMiddleware
} = require('../middleware/cloudinaryUpload');
const {
  uploadAvatar,
  uploadResume,
  uploadLogo,
  deleteFile,
  getUploadSignature
} = require('../controllers/cloudinaryUploadController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Avatar upload (Intern only)
router.post('/avatar', 
  uploadAvatarMiddleware('avatar'), 
  uploadAvatar
);

// Resume upload (Intern only)
router.post('/resume', 
  uploadResumeMiddleware('resume'), 
  uploadResume
);

// Logo upload (Company only)
router.post('/logo', 
  uploadLogoMiddleware('logo'), 
  uploadLogo
);


// Delete file
router.delete('/delete', deleteFile);

// Get upload signature for direct frontend uploads
router.post('/signature', getUploadSignature);

module.exports = router;
