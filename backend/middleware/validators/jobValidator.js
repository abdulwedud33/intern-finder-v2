const { check, validationResult } = require('express-validator');

// Validation for creating a job
exports.validateCreateJob = [
  check('title', 'Title is required').notEmpty().trim().escape(),
  check('description', 'Description is required').notEmpty().trim().escape(),
  check('requirements', 'Requirements are required').notEmpty().trim().escape(),
  check('responsibilities', 'Responsibilities are required').notEmpty().trim().escape(),
  check('type', 'Job type is required').notEmpty().isIn([
    'remote', 
    'onsite', 
    'hybrid'
  ]),
  check('location', 'Location is required').notEmpty().trim().escape(),
  check('salary', 'Salary information is required').notEmpty().trim().escape(),
  check('duration', 'Duration is required')
    .notEmpty()
    .trim()
    .escape(),
  check('deadline', 'Application deadline is required').optional().isISO8601(),
  check('isRemote', 'Remote status must be a boolean').optional().isBoolean(),
  check('status', 'Invalid status').optional().isIn(['draft', 'published', 'closed', 'filled']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Validation for updating a job
exports.validateUpdateJob = [
  check('title', 'Title cannot be empty').optional().trim().escape(),
  check('description', 'Description cannot be empty').optional().trim().escape(),
  check('requirements', 'Requirements cannot be empty').optional().trim().escape(),
  check('responsibilities', 'Responsibilities cannot be empty').optional().trim().escape(),
  check('type', 'Invalid job type').optional().isIn([
    'remote', 
    'onsite', 
    'hybrid'
  ]),
  check('location', 'Location cannot be empty').optional().trim().escape(),
  check('salary', 'Salary cannot be empty').optional().trim().escape(),
  check('duration', 'Duration cannot be empty').optional().trim().escape(),
  check('deadline', 'Invalid deadline format').optional().isISO8601(),
  check('isRemote', 'Remote status must be a boolean').optional().isBoolean(),
  check('status', 'Invalid status').optional().isIn(['draft', 'published', 'closed', 'filled']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Middleware to check if job exists and user has permission
exports.checkJobOwnership = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user is the owner or admin
    if (job.companyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to perform this action'
      });
    }

    // Attach job to request object for use in the next middleware
    req.job = job;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to validate file uploads
exports.validateFileUpload = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next();
  }

  const { image, additionalFiles } = req.files;
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Validate main image if present
  if (image) {
    if (!allowedImageTypes.includes(image.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Only JPEG, PNG, and GIF are allowed.'
      });
    }

    if (image.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        error: 'Image size must be less than 5MB'
      });
    }
  }

  // Validate additional files if present
  if (additionalFiles) {
    for (const file of additionalFiles) {
      if (!allowedDocTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `Invalid file format for ${file.originalname}. Only PDF, DOC, and DOCX are allowed.`
        });
      }

      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          error: `File size for ${file.originalname} must be less than 5MB`
        });
      }
    }
  }

  next();
};
