const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * @desc    Get all jobs
 * @route   GET /api/v1/jobs
 * @route   GET /api/v1/companies/:companyId/jobs
 * @access  Public
 */
exports.getJobs = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Parse the query string to JSON
  let queryObj = JSON.parse(queryStr);

  // If company ID is provided in params, filter by that company
  if (req.params.companyId) {
    queryObj.companyId = req.params.companyId;
  }

  // If user is an intern, don't show expired jobs
  if (req.user && req.user.role === 'intern') {
    queryObj.deadline = { $gte: new Date() };
    queryObj.status = 'published';
  }

  // Finding resource - no need to populate since we store companyName directly
  let query = Job.find(queryObj);

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Job.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const jobs = await query;

  // No need for complex company population logic since we store companyName directly

  // Transform jobs to ensure data is properly formatted for frontend
  const transformedJobs = jobs.map(job => {
    const jobObj = job.toObject();
    
    // Fix HTML entity encoding in salary
    if (jobObj.salary && typeof jobObj.salary === 'string') {
      jobObj.salary = jobObj.salary
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");
    }
    
    // Create company object - use companyName if available, otherwise use a default
    jobObj.company = {
      _id: jobObj.companyId,
      name: jobObj.companyName || "Tech Company", // Better default name
      logo: null,
      industry: null,
      companySize: null
    };
    
    // Keep companyId for reference but also provide company object
    return jobObj;
  });

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: transformedJobs.length,
    pagination,
    data: transformedJobs
  });
});

/**
 * @desc    Get single job with details
 * @route   GET /api/v1/jobs/detail/:id
 * @access  Public
 */
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id)
    .populate({
      path: 'companyId',
      select: 'name logo industry companySize website'
    })
    .populate({
      path: 'skills',
      select: 'name'
    });

  if (!job) {
    return next(
      new ErrorResponse(`Job not found with id of ${req.params.id}`, 404)
    );
  }

  // If user is an intern, check if they've already applied
  if (req.user && req.user.role === 'intern') {
    const application = await Application.findOne({
      job: job._id,
      user: req.user.id
    });
    
    if (application) {
      job.applied = true;
      job.applicationStatus = application.status;
    } else {
      job.applied = false;
    }
  }

  res.status(200).json({
    success: true,
    data: job
  });
});

/**
 * @desc    Get jobs for the authenticated company
 * @route   GET /api/v1/jobs/company
 * @access  Private (Company)
 */
exports.getCompanyJobs = asyncHandler(async (req, res, next) => {
  // For company users, get jobs by companyId
  // If no jobs found with companyId, also check for jobs with null companyId (legacy data)
  let jobs = await Job.find({ companyId: req.user._id })
    .populate('applications', 'status')
    .sort('-createdAt');

  // If no jobs found and user is a company, also check for jobs with null companyId
  // This handles the case where jobs were created before proper company association
  if (jobs.length === 0 && req.user.role === 'company') {
    console.log('No jobs found with companyId, checking for null companyId jobs');
    jobs = await Job.find({ companyId: null })
      .populate('applications', 'status')
      .sort('-createdAt');
    
    // Update these jobs to have the correct companyId
    if (jobs.length > 0) {
      console.log(`Found ${jobs.length} jobs with null companyId, updating them`);
      await Job.updateMany(
        { companyId: null },
        { companyId: req.user._id }
      );
    }
  }

  const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
  const totalJobs = jobs.length;

  // If this is the first time a company is accessing their jobs and we found null companyId jobs,
  // update a few of them to published status for better visibility
  if (jobs.length > 0 && req.user.role === 'company') {
    // Update the first few jobs to published status if they're still draft
    const draftJobs = jobs.filter(job => job.status === 'draft');
    if (draftJobs.length > 0) {
      const jobsToPublish = draftJobs.slice(0, 3); // Publish first 3 draft jobs
      await Job.updateMany(
        { _id: { $in: jobsToPublish.map(job => job._id) } },
        { status: 'published' }
      );
      
      // Refresh the jobs data to include the updated status
      jobs = await Job.find({ companyId: req.user._id })
        .populate('applications', 'status')
        .sort('-createdAt');
    }
  }

  res.status(200).json({
    success: true,
    data: {
      jobs,
      totalViews,
      totalJobs
    }
  });
});

/**
 * @desc    Create new job
 * @route   POST /api/v1/jobs/create
 * @access  Private (Company)
 */
exports.createJob = asyncHandler(async (req, res, next) => {
  try {
    // Add company to req.body (already validated in middleware)
    req.body.companyId = req.user._id;
    req.body.companyName = req.user.name; // Add company name directly
    
    // Set default status if not provided
    if (!req.body.status) {
      req.body.status = 'draft';
    }

    // Handle file uploads (already validated in middleware)
    if (req.files) {
      if (req.files.image) {
        req.body.image = req.files.image[0].filename;
      }
      if (req.files.additionalFiles) {
        req.body.additionalFiles = req.files.additionalFiles.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path
        }));
      }
    }

    const job = await Job.create(req.body);

    // Populate company details
    await job.populate({
      path: 'companyId',
      select: 'name logo industry companySize'
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    // Clean up uploaded files if there was an error
    if (req.files) {
      const cleanUpPromises = [];
      
      if (req.files.image) {
        cleanUpPromises.push(unlinkAsync(req.files.image[0].path));
      }
      
      if (req.files.additionalFiles) {
        req.files.additionalFiles.forEach(file => {
          cleanUpPromises.push(unlinkAsync(file.path));
        });
      }
      
      await Promise.all(cleanUpPromises);
    }
    
    next(error);
  }
});

/**
 * @desc    Update job
 * @route   PUT /api/v1/jobs/update/:id
 * @access  Private (Company)
 */
exports.updateJob = asyncHandler(async (req, res, next) => {
  try {
    const job = req.job; // From checkJobOwnership middleware
    const oldImage = job.image;
    const oldAdditionalFiles = job.additionalFiles || [];
    let newImage = null;
    let newAdditionalFiles = [];

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        newImage = req.files.image[0].filename;
        req.body.image = newImage;
      }
      
      if (req.files.additionalFiles) {
        newAdditionalFiles = req.files.additionalFiles.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path
        }));
        
        // Merge with existing files if any
        req.body.additionalFiles = [...oldAdditionalFiles, ...newAdditionalFiles];
      }
    }

  // Make sure user is job owner
  if (job.companyId.toString() !== req.user._id.toString()) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this job`,
        401
      )
    );
  }

    // Prevent changing company ownership
    if (req.body.companyId && req.body.companyId !== job.companyId.toString()) {
      return next(
        new ErrorResponse('You cannot change the company of a job', 400)
      );
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate({
      path: 'companyId',
      select: 'name logo industry companySize'
    });

    // Clean up old files if they were replaced
    if (newImage && oldImage) {
      try {
        await unlinkAsync(path.join(__dirname, `../public/uploads/${oldImage}`));
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    // Clean up newly uploaded files if there was an error
    if (req.files) {
      const cleanUpPromises = [];
      
      if (req.files.image) {
        cleanUpPromises.push(unlinkAsync(req.files.image[0].path));
      }
      
      if (req.files.additionalFiles) {
        req.files.additionalFiles.forEach(file => {
          cleanUpPromises.push(unlinkAsync(file.path));
        });
      }
      
      await Promise.all(cleanUpPromises);
    }
    
    next(error);
  }
});

/**
 * @desc    Delete job (soft delete)
 * @route   PUT /api/v1/jobs/delete/:id
 * @access  Private (Company, Admin)
 */
exports.deleteJob = asyncHandler(async (req, res, next) => {
  try {
    const job = req.job; // From checkJobOwnership middleware
    const { image, additionalFiles = [] } = job;

    // Soft delete by setting isDeleted flag
    job.isDeleted = true;
    job.status = 'closed';
    job.closedAt = Date.now();
    await job.save();

    // Note: No need to update Company's jobs array since it's a virtual field

    // Schedule cleanup of files after a delay (e.g., 30 days)
    const cleanupDate = new Date();
    cleanupDate.setDate(cleanupDate.getDate() + 30);
    
    // In a production environment, you might want to use a job scheduler here
    // For now, we'll just log the files that would be deleted
    console.log(`Scheduled cleanup for job ${job._id} files on ${cleanupDate}`);
    console.log('Files to be deleted:', { image, additionalFiles });

    res.status(200).json({ 
      success: true, 
      data: {},
      message: 'Job has been marked as deleted. Files will be cleaned up after 30 days.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get jobs by company
 * @route   GET /api/v1/jobs/company/:companyId
 * @access  Public
 */
exports.getJobsByCompany = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({ companyId: req.params.companyId });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Search jobs
 * @route   GET /api/v1/jobs/search
 * @access  Public
 */
exports.searchJobs = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const jobs = await Job.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Get jobs within a radius
 * @route   GET /api/v1/jobs/radius/:zipcode/:distance
 * @access  Public
 */
exports.getJobsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const jobs = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    },
    status: 'published',
    deadline: { $gte: new Date() }
  }).populate({
    path: 'companyId',
    select: 'name logo industry'
  });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Upload photo for job
 * @route   PUT /api/v1/jobs/:id/photo
 * @access  Private (Company owner or admin)
 */
exports.jobPhotoUpload = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(
      new ErrorResponse(`Job not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is job owner or admin
  if (job.companyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this job`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  const maxSize = parseInt(process.env.MAX_FILE_UPLOAD) || 1000000; // Default 1MB
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${maxSize} bytes`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${job._id}${path.parse(file.name).ext}`;
  
  // Create uploads directory if it doesn't exist
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  file.mv(`${uploadPath}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Job.findByIdAndUpdate(req.params.id, { 
      photo: file.name,
      updatedAt: Date.now()
    });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

/**
 * @desc    Get job statistics for a company
 * @route   GET /api/v1/jobs/stats/company
 * @access  Private (Company only)
 */
exports.getJobStats = asyncHandler(async (req, res, next) => {
  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(
      new ErrorResponse('Only companies can view job statistics', 403)
    );
  }

  // For company users, req.user is the Company document itself
  // For regular users, we'd need req.user.company, but we don't support that flow
  const companyId = req.user._id;

  try {
    // Get job statistics
    const stats = await Job.aggregate([
      {
        $match: { companyId: new mongoose.Types.ObjectId(companyId) }
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

    // Get total jobs
    const totalJobs = await Job.countDocuments({ companyId: companyId });
    
    // Get total applications for all jobs
    const jobs = await Job.find({ companyId: companyId }).select('_id');
    const jobIds = jobs.map(job => job._id);
    const totalApplications = await Application.countDocuments({ 
      job: { $in: jobIds } 
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalJobs,
        stats: formattedStats,
        totalApplications
      }
    });
  } catch (error) {
    console.error('Error in getJobStats:', error);
    return next(new ErrorResponse('Failed to fetch job statistics', 500));
  }
});

/**
 * @desc    Close a job (mark as filled or closed)
 * @route   PUT /api/v1/jobs/:id/close
 * @access  Private (Company owner or admin)
 */
exports.closeJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(
      new ErrorResponse(`Job not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is job owner or admin
  if (job.companyId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to close this job`,
        401
      )
    );
  }

  // Update job status
  job.status = req.body.status === 'filled' ? 'filled' : 'closed';
  job.filledAt = Date.now();
  
  await job.save();

  res.status(200).json({
    success: true,
    data: job
  });
});
