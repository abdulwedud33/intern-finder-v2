const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage configuration for different file types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      resource_type: 'auto', // Automatically detect resource type
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    }
  });
};

// File filter function
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    // Check MIME type
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`), false);
    }
  };
};

// Image file types
const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Document file types
const documentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Mixed file types (images + documents)
const mixedTypes = [...imageTypes, ...documentTypes];

// Storage configurations
const avatarStorage = createStorage('intern-finder/avatars', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
const logoStorage = createStorage('intern-finder/logos', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
const resumeStorage = createStorage('intern-finder/resumes', ['pdf', 'doc', 'docx']);

// Multer configurations
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: createFileFilter(imageTypes),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: createFileFilter(imageTypes),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: createFileFilter(documentTypes),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});


// Middleware functions for different upload types
const uploadAvatarMiddleware = (fieldName = 'avatar') => {
  return (req, res, next) => {
    const uploadSingle = uploadAvatar.single(fieldName);
    uploadSingle(req, res, (err) => {
      if (err) {
        console.error('Avatar upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      if (req.file) {
        console.log(`Avatar uploaded successfully: ${req.file.path}`);
      }
      
      next();
    });
  };
};

const uploadLogoMiddleware = (fieldName = 'logo') => {
  return (req, res, next) => {
    const uploadSingle = uploadLogo.single(fieldName);
    uploadSingle(req, res, (err) => {
      if (err) {
        console.error('Logo upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      if (req.file) {
        console.log(`Logo uploaded successfully: ${req.file.path}`);
      }
      
      next();
    });
  };
};

const uploadResumeMiddleware = (fieldName = 'resume') => {
  return (req, res, next) => {
    const uploadSingle = uploadResume.single(fieldName);
    uploadSingle(req, res, (err) => {
      if (err) {
        console.error('Resume upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      if (req.file) {
        console.log(`Resume uploaded successfully: ${req.file.path}`);
      }
      
      next();
    });
  };
};


module.exports = {
  cloudinary,
  uploadAvatarMiddleware,
  uploadLogoMiddleware,
  uploadResumeMiddleware,
  uploadAvatar,
  uploadLogo,
  uploadResume
};
