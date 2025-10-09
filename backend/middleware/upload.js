const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
    
    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for images and PDFs
const mixedFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed'), false);
  }
};

// Configure multer for images only
const uploadImages = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure multer for images and PDFs
const uploadMixed = multer({
  storage: storage,
  fileFilter: mixedFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for PDFs
  }
});

// Middleware for single file upload (images and PDFs)
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadSingleFile = uploadMixed.single(fieldName);
    uploadSingleFile(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      // Log successful upload
      if (req.file) {
        console.log(`File uploaded successfully: ${req.file.filename} to ${req.file.path}`);
      }
      
      next();
    });
  };
};

module.exports = {
  upload: uploadMixed, // Default to mixed uploads
  uploadImages,
  uploadMixed,
  uploadSingle
};
