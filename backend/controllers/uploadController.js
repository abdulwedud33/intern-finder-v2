const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const fs = require('fs');
const Intern = require('../models/Intern');
const Company = require('../models/Company');
const Job = require('../models/Job');

/**
 * @desc    Upload resume for intern
 * @route   POST /api/v1/uploads/resume
 * @access  Private (Intern)
 */
exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to upload resume', 403));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the file is a PDF or document
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new ErrorResponse('Please upload a PDF or Word document', 400));
  }

  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 10000000; // 10MB default
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(`Please upload a file less than ${maxSize} bytes`, 400)
    );
  }

  // Create custom filename
  file.name = `resume_${req.user.id}${path.parse(file.name).ext}`;

  // Create uploads directory if it doesn't exist
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Upload file
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    // Update intern resume
    const intern = await Intern.findByIdAndUpdate(
      req.user.id,
      { resume: file.name },
      { new: true, runValidators: true }
    )
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        url: `/uploads/${file.name}`,
        filename: file.name,
        size: file.size,
        type: file.mimetype
      }
    });
  });
});

/**
 * @desc    Upload profile photo for intern
 * @route   POST /api/v1/uploads/profile-photo
 * @access  Private (Intern)
 */
exports.uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to upload profile photo', 403));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 5000000; // 5MB default
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(`Please upload an image less than ${maxSize} bytes`, 400)
    );
  }

  // Create custom filename
  file.name = `profile_${req.user.id}${path.parse(file.name).ext}`;

  // Create uploads directory if it doesn't exist
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Upload file
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    // Update intern profile picture
    const intern = await Intern.findByIdAndUpdate(
      req.user.id,
      { photo: file.name },
      { new: true, runValidators: true }
    )
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        url: `/uploads/${file.name}`,
        filename: file.name,
        size: file.size,
        type: file.mimetype
      }
    });
  });
});

/**
 * @desc    Upload company logo
 * @route   POST /api/v1/uploads/company-logo
 * @access  Private (Company)
 */
exports.uploadCompanyLogo = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Not authorized to upload company logo', 403));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 5000000; // 5MB default
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(`Please upload an image less than ${maxSize} bytes`, 400)
    );
  }

  // Create custom filename
  file.name = `logo_${req.user.id}${path.parse(file.name).ext}`;

  // Create uploads directory if it doesn't exist
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Upload file
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    // Update company logo
    const company = await Company.findByIdAndUpdate(
      req.user.id,
      { logo: file.name },
      { new: true, runValidators: true }
    )
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        url: `/uploads/${file.name}`,
        filename: file.name,
        size: file.size,
        type: file.mimetype
      }
    });
  });
});

/**
 * @desc    Upload job photo
 * @route   POST /api/v1/uploads/job-photo
 * @access  Private (Company)
 */
exports.uploadJobPhoto = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Not authorized to upload job photo', 403));
  }

  const { jobId } = req.body;

  if (!jobId) {
    return next(new ErrorResponse('Job ID is required', 400));
  }

  const job = await Job.findById(jobId);

  if (!job) {
    return next(new ErrorResponse('Job not found', 404));
  }

  // Make sure user is job owner
  if (job.company.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to upload photo for this job', 403));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 5000000; // 5MB default
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(`Please upload an image less than ${maxSize} bytes`, 400)
    );
  }

  // Create custom filename
  file.name = `job_${jobId}${path.parse(file.name).ext}`;

  // Create uploads directory if it doesn't exist
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Upload file
  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    // Update job photo
    await Job.findByIdAndUpdate(jobId, { 
      photo: file.name,
      updatedAt: Date.now()
    });

    res.status(200).json({
      success: true,
      data: {
        url: `/uploads/${file.name}`,
        filename: file.name,
        size: file.size,
        type: file.mimetype
      }
    });
  });
});

/**
 * @desc    Delete uploaded file
 * @route   DELETE /api/v1/uploads/delete
 * @access  Private
 */
exports.deleteFile = asyncHandler(async (req, res, next) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return next(new ErrorResponse('File URL is required', 400));
  }

  // Extract filename from URL
  const filename = path.basename(fileUrl);
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  const filePath = path.join(uploadPath, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return next(new ErrorResponse('File not found', 404));
  }

  // Delete file
  fs.unlinkSync(filePath);

  res.status(200).json({
    success: true,
    message: 'File deleted successfully'
  });
});
