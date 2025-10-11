const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { cloudinary } = require('../middleware/cloudinaryUpload');
const Intern = require('../models/Intern');
const Company = require('../models/Company');
const Job = require('../models/Job');

/**
 * @desc    Upload avatar for intern
 * @route   POST /api/v1/uploads/cloudinary/avatar
 * @access  Private (Intern)
 */
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to upload avatar', 403));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Get the Cloudinary URL from the uploaded file
  const avatarUrl = req.file.path;

  // Update intern avatar
  const intern = await Intern.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true, runValidators: true }
  )
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .lean();

  res.status(200).json({
    success: true,
    data: {
      url: avatarUrl,
      public_id: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype,
      user: intern
    }
  });
});

/**
 * @desc    Upload resume for job application
 * @route   POST /api/v1/uploads/cloudinary/resume
 * @access  Private (Intern)
 */
exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to upload resume', 403));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Get the Cloudinary URL from the uploaded file
  const resumeUrl = req.file.path;

  // Return the URL for application use (not updating intern profile)
  res.status(200).json({
    success: true,
    data: {
      url: resumeUrl,
      public_id: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype
    }
  });
});

/**
 * @desc    Upload company logo
 * @route   POST /api/v1/uploads/cloudinary/logo
 * @access  Private (Company)
 */
exports.uploadLogo = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Not authorized to upload company logo', 403));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Get the Cloudinary URL from the uploaded file
  const logoUrl = req.file.path;

  // Update company logo
  const company = await Company.findByIdAndUpdate(
    req.user.id,
    { logo: logoUrl },
    { new: true, runValidators: true }
  )
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .lean();

  res.status(200).json({
    success: true,
    data: {
      url: logoUrl,
      public_id: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype,
      user: company
    }
  });
});


/**
 * @desc    Delete file from Cloudinary
 * @route   DELETE /api/v1/uploads/cloudinary/delete
 * @access  Private
 */
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const { publicId } = req.body;

  if (!publicId) {
    return next(new ErrorResponse('Public ID is required', 400));
  }

  try {
    // Delete file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        result: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete file',
        result: result
      });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return next(new ErrorResponse('Failed to delete file', 500));
  }
});

/**
 * @desc    Get upload signature for direct frontend uploads
 * @route   POST /api/v1/uploads/cloudinary/signature
 * @access  Private
 */
exports.getUploadSignature = asyncHandler(async (req, res, next) => {
  const { folder, resourceType = 'image' } = req.body;

  if (!folder) {
    return next(new ErrorResponse('Folder is required', 400));
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder,
        resource_type: resourceType
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        resourceType
      }
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return next(new ErrorResponse('Failed to generate upload signature', 500));
  }
});
