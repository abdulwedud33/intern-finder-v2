const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Create a new application for a job
 * @route   POST /api/v1/applications
 * @access  Private (Interns only)
 */
exports.createApplication = asyncHandler(async (req, res, next) => {
  const { jobId, coverLetter } = req.body;
  
  // Verify the job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorResponse(`No job found with the id of ${jobId}`, 404));
  }

  // Check if the user is an intern
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Only interns can apply to jobs', 403));
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    internId: req.user.id,
    jobId: jobId
  });

  if (existingApplication) {
    return next(
      new ErrorResponse('You have already applied to this job', 400)
    );
  }

  // Handle resume file upload
  let resumePath = '';
  if (req.file) {
    resumePath = `/uploads/${req.file.filename}`;
  }

  // Create the application
  console.log('createApplication - Creating application with:');
  console.log('  jobId:', jobId);
  console.log('  companyId:', job.companyId);
  console.log('  internId:', req.user.id);
  console.log('  coverLetter:', coverLetter || '');
  console.log('  resume:', resumePath);
  
  const application = await Application.create({
    jobId: jobId,
    companyId: job.companyId,
    internId: req.user.id,
    coverLetter: coverLetter || '',
    resume: resumePath,
    status: 'under_review'
  });
  
  console.log('createApplication - Application created:', application);

  // Populate the intern and job details
  await application.populate([
    { path: 'internId', select: 'name email avatar' },
    { path: 'jobId', select: 'title description' }
  ]);

  res.status(201).json({
    success: true,
    data: application
  });
});

/**
 * @desc    Get all applications for the logged-in company
 * @route   GET /api/v1/applications/company
 * @access  Private (Company only)
 */
exports.getCompanyApplications = asyncHandler(async (req, res, next) => {
  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Only companies can view their applications', 403));
  }

  // Get jobs created by the company
  const jobs = await Job.find({ companyId: req.user.id }).select('_id');
  const jobIds = jobs.map(job => job._id);

  // Find all applications for the company's jobs
  const applications = await Application.find({ jobId: { $in: jobIds } })
    .populate({
      path: 'internId',
      select: 'name email photo'
    })
    .populate({
      path: 'jobId',
      select: 'title description'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

/**
 * @desc    Get all applications for the logged-in intern
 * @route   GET /api/v1/applications/me
 * @access  Private (Intern only)
 */
exports.getMyApplications = asyncHandler(async (req, res, next) => {
  // Check if user is an intern
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Only interns can view their applications', 403));
  }

  console.log('getMyApplications - User ID:', req.user.id);
  console.log('getMyApplications - User ID type:', typeof req.user.id);
  console.log('getMyApplications - User role:', req.user.role);
  
  // Debug: Check what applications exist in the database
  const allApplications = await Application.find({});
  console.log('getMyApplications - All applications in DB:', allApplications.length);
  allApplications.forEach(app => {
    console.log(`  App ID: ${app._id}, Intern ID: ${app.internId}, Job ID: ${app.jobId}`);
  });
  
  // Find all applications for the intern
  const applications = await Application.find({ internId: req.user.id })
    .populate({
      path: 'jobId',
      select: 'title companyName description location'
    })
    .populate({
      path: 'companyId',
      select: 'name logo'
    })
    .sort({ createdAt: -1 });

  console.log('getMyApplications - Found applications:', applications.length);
  console.log('getMyApplications - Applications:', applications);

  // Debug information to help identify the issue
  const debugInfo = {
    userId: req.user.id,
    userIdType: typeof req.user.id,
    userRole: req.user.role,
    totalApplicationsInDB: allApplications.length,
    applicationsFound: applications.length,
    allApplicationInternIds: allApplications.map(app => ({
      appId: app._id,
      internId: app.internId,
      internIdType: typeof app.internId
    }))
  };

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
    debug: debugInfo // Temporary debug info
  });
});

/**
 * @desc    Get single application
 * @route   GET /api/v1/applications/:id
 * @access  Private (Application owner or company)
 */
exports.getApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'internId',
      select: 'name email phone photo'
    })
    .populate({
      path: 'jobId',
      select: 'title description requirements'
    })
    .populate({
      path: 'companyId',
      select: 'name logo'
    });

  if (!application) {
    return next(
      new ErrorResponse(`No application found with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is application owner or company
  if (
    application.internId._id.toString() !== req.user.id &&
    application.companyId._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this application`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

/**
 * @desc    Update application status
 * @route   PUT /api/v1/applications/:id/status
 * @access  Private (Company only)
 */
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Only companies can update application status', 403));
  }

  // Find the application
  let application = await Application.findById(id);
  
  if (!application) {
    return next(
      new ErrorResponse(`No application found with the id of ${id}`, 404)
    );
  }

  // Make sure the application belongs to the company
  if (application.company.toString() !== req.user._id.toString()) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this application`,
        401
      )
    );
  }

  // Update the status
  application.status = status;
  application.updatedAt = Date.now();
  
  // Add status update to history
  application.statusHistory.push({
    status,
    changedBy: req.user.id,
    changedAt: Date.now()
  });

  await application.save();

  // Populate the response
  application = await application
    .populate({
      path: 'user',
      select: 'name email'
    })
    .populate({
      path: 'job',
      select: 'title'
    })
    .execPopulate();

  // TODO: Send email notification to the intern about status update

  res.status(200).json({
    success: true,
    data: application
  });
});

/**
 * @desc    Delete application
 * @route   DELETE /api/v1/applications/:id
 * @access  Private (Application owner or admin)
 */
exports.deleteApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(
      new ErrorResponse(`No application found with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is application owner or admin
  if (
    application.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this application`,
        401
      )
    );
  }

  await application.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get application statistics for the logged-in company
 * @route   GET /api/v1/applications/stats/company
 * @access  Private (Company only)
 */
exports.getCompanyApplicationStats = asyncHandler(async (req, res, next) => {
  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Only companies can view application stats', 403));
  }

  // Get jobs created by the company
  const jobs = await Job.find({ company: req.user.id }).select('_id');
  const jobIds = jobs.map(job => job._id);

  // Get application stats
  const stats = await Application.aggregate([
    {
      $match: { job: { $in: jobIds } }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format the stats
  const formattedStats = {};
  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
  });

  // Get total applications
  const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

  res.status(200).json({
    success: true,
    data: {
      total: totalApplications,
      stats: formattedStats
    }
  });
});

/**
 * @desc    Get application statistics for the logged-in intern
 * @route   GET /api/v1/applications/stats/me
 * @access  Private (Intern only)
 */
exports.getMyApplicationStats = asyncHandler(async (req, res, next) => {
  // Check if user is an intern
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Only interns can view their application stats', 403));
  }

  // Get application stats
  const stats = await Application.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req.user.id) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format the stats
  const formattedStats = {};
  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
  });

  // Get total applications
  const totalApplications = await Application.countDocuments({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: {
      total: totalApplications,
      stats: formattedStats
    }
  });
});

// --- Middleware ---

/**
 * @desc    Check if user can access the application
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 */
exports.checkApplicationAccess = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(
      new ErrorResponse(`No application found with the id of ${req.params.id}`, 404)
    );
  }

  // Check if user is the application owner, company, or admin
  if (
    application.internId.toString() !== req.user.id &&
    application.companyId.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this application`,
        401
      )
    );
  }

  req.application = application;
  next();
});

// @desc      Get all applications for the logged-in intern
// @route     GET /api/applications/interns
// @access    Private (Interns only)
exports.getMyApplications = asyncHandler(async (req, res, next) => {
  const applications = await Application.find({ user: req.user.id })
    .populate({
      path: 'listing',
      select: 'title companyName status deadline'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc      Get single application by ID
// @route     GET /api/applications/:id
// @access    Private
// @note      Both company and intern can access, but with different permissions
exports.getApplicationById = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name email'
    })
    .populate({
      path: 'listing',
      select: 'title companyName user'
    });

  if (!application) {
    return next(
      new ErrorResponse(`No application with the id of ${req.params.id}`, 404)
    );
  }

  // Check permissions
  const isOwner = application.user._id.toString() === req.user.id;
  const isCompanyOwner = application.listing?.user?.toString() === req.user.id;
  
  if (!isOwner && !isCompanyOwner) {
    return next(
      new ErrorResponse('Not authorized to access this application', 403)
    );
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc      Get applications by job ID
// @route     GET /api/applications/job/:jobId
// @access    Private (Company only)
exports.getApplicationsByJobId = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  
  // First verify the job exists and is owned by the company
  const job = await Job.findOne({
    _id: jobId,
    companyId: req.user.id // Ensure the job belongs to the company
  });

  if (!job) {
    return next(
      new ErrorResponse(`No job found with the id of ${jobId}`, 404)
    );
  }

  const applications = await Application.find({ jobId: jobId })
    .populate({
      path: 'internId',
      select: 'name email photo'
    });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc      Pre-check job application
// @route     GET /api/applications/precheck/:jobId
// @access    Private (Interns only)
exports.preCheckJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(
      new ErrorResponse(`No job found with the id of ${jobId}`, 404)
    );
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    internId: userId,
    jobId: jobId
  });

  res.status(200).json({
    success: true,
    data: {
      hasApplied: !!existingApplication,
      job: {
        id: job._id,
        title: job.title,
        companyName: job.companyName,
        status: job.status,
        deadline: job.deadline
      }
    }
  });
});
