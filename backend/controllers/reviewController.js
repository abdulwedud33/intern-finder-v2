const Review = require('../models/Review');
const { User } = require('../models/User');
const Company = require('../models/Company');
const Intern = require('../models/Intern');
const Job = require('../models/Job');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Review.find(JSON.parse(queryStr))
    .populate({
      path: 'reviewer',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate({
      path: 'target',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate('job', 'title company');

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
  const total = await Review.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const reviews = await query;

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
    count: reviews.length,
    pagination,
    data: reviews
  });
});

/**
 * @desc    Get single review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: 'reviewer',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate({
      path: 'target',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate('job', 'title company');

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Create new review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
exports.createReview = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.reviewer = req.user.id;

  // Check if user has already reviewed the target for this job
  const existingReview = await Review.findOne({
    reviewer: req.user.id,
    target: req.body.target,
    job: req.body.job
  });

  if (existingReview) {
    return next(
      new ErrorResponse(
        `You have already reviewed this ${req.body.targetType} for this job`,
        400
      )
    );
  }

  // Prevent users from reviewing themselves
  if (req.user.id === req.body.target) {
    return next(
      new ErrorResponse('You cannot review yourself', 400)
    );
  }

  // Check if the target user exists and has the correct role
  const targetUser = await User.findById(req.body.target);
  if (!targetUser) {
    return next(
      new ErrorResponse('The user being reviewed does not exist', 404)
    );
  }

  // Validate review type based on target user role
  if (
    (req.body.reviewType === 'company' && targetUser.role !== 'company') ||
    (req.body.reviewType === 'intern' && targetUser.role !== 'intern')
  ) {
    return next(
      new ErrorResponse(`Review type does not match the target user's role`, 400)
    );
  }

  // Ensure feedback field is handled properly
  const reviewData = {
    ...req.body,
    feedback: req.body.feedback || undefined
  };
  
  const review = await Review.create(reviewData);

  // Populate the response
  const populatedReview = await Review.findById(review._id)
    .populate({
      path: 'reviewer',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate({
      path: 'target',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate('job', 'title company');

  res.status(201).json({
    success: true,
    data: populatedReview
  });
});

/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is review owner or admin
  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this review`,
        401
      )
    );
  }

  // Prevent changing the review type or target after creation
  if (req.body.reviewType || req.body.target) {
    return next(
      new ErrorResponse('Cannot change review type or target after creation', 400)
    );
  }

  // Only allow updating rating and comment
  const { rating, comment } = req.body;
  const updateFields = {};
  
  if (rating !== undefined) updateFields.rating = rating;
  if (comment !== undefined) updateFields.comment = comment;

  review = await Review.findByIdAndUpdate(
    req.params.id,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  )
  .populate({
    path: 'reviewer',
    select: 'name avatar role',
    populate: {
      path: 'role',
      select: 'name'
    }
  })
  .populate({
    path: 'target',
    select: 'name avatar role',
    populate: {
      path: 'role',
      select: 'name'
    }
  })
  .populate('job', 'title company');

  res.status(200).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is review owner or admin
  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this review`,
        401
      )
    );
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get reviews for a specific target (company or intern)
 * @route   GET /api/v1/reviews/target/:targetId
 * @access  Public
 */
exports.getReviewsForTarget = asyncHandler(async (req, res, next) => {
  const { targetId } = req.params;
  const { type = 'all' } = req.query; // all, company, intern

  // Check if target user exists
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Build query
  const query = { target: targetId };

  // Filter by review type if specified
  if (type !== 'all') {
    // Validate that the type matches the target user's role
    if (
      (type === 'company' && targetUser.role !== 'company') ||
      (type === 'intern' && targetUser.role !== 'intern')
    ) {
      return next(
        new ErrorResponse(`No ${type} reviews found for this user`, 404)
      );
    }
    query.targetModel = type === 'company' ? 'Company' : 'Intern';
  }

  const reviews = await Review.find(query)
    .populate({
      path: 'reviewer',
      select: 'name avatar role'
    })
    .populate({
      path: 'target',
      select: 'name avatar role'
    })
    .populate('job', 'title companyName');

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length 
    : 0;

  res.status(200).json({
    success: true,
    count: reviews.length,
    averageRating: parseFloat(avgRating.toFixed(1)),
    data: reviews
  });
});

/**
 * @desc    Get reviews by the current user
 * @route   GET /api/v1/reviews/me
 * @access  Private
 */
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ reviewer: req.user.id })
    .populate({
      path: 'target',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate('job', 'title company');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

/**
 * @desc    Get reviews about the current user
 * @route   GET /api/v1/reviews/about-me
 * @access  Private
 */
// @access  Private
// @desc    Create/Update intern review
// @route   POST /api/v1/reviews/intern-reviews/:internId/:jobId
// @access  Private (Company)
exports.createOrUpdateInternReview = asyncHandler(async (req, res, next) => {
  const { internId, jobId } = req.params;
  const { rating, feedback } = req.body;
  const companyId = req.user._id; // Company users are stored directly in Company model

  // Check if company exists and is verified
  const company = await Company.findById(companyId);
  if (!company) {
    return next(new ErrorResponse('Company not found', 404));
  }

  // Check if intern exists
  const intern = await Intern.findById(internId);
  if (!intern) {
    return next(new ErrorResponse('Intern not found', 404));
  }

  // Check if job exists and belongs to company
  const job = await Job.findOne({ _id: jobId, company: companyId });
  if (!job) {
    return next(new ErrorResponse('Job not found or not authorized', 404));
  }

  // Check if review already exists
  let review = await Review.findOneAndUpdate(
    {
      reviewer: companyId,
      target: internId,
      job: jobId,
      direction: 'company_to_intern'
    },
    {
      rating,
      content: feedback,
      targetModel: 'Intern',
      status: 'approved',
      $setOnInsert: {
        reviewer: companyId,
        target: internId,
        job: jobId,
        direction: 'company_to_intern',
        targetModel: 'Intern'
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Get company's intern reviews
// @route   GET /api/v1/reviews/intern-reviews
// @access  Private (Company)
exports.getCompanyInternReviews = asyncHandler(async (req, res, next) => {
  const companyId = req.user._id; // Company users are stored directly in Company model
  
  const reviews = await Review.find({
    reviewer: companyId,
    direction: 'company_to_intern',
    targetModel: 'Intern'
  })
  .populate('target', 'name email')
  .populate('job', 'title');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Create/Update company review
// @route   POST /api/v1/reviews/company-reviews/:companyId
// @access  Private (Intern)
exports.createOrUpdateCompanyReview = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { rating, feedback } = req.body;
  const internId = req.user.intern;

  // Check if intern exists
  const intern = await Intern.findById(internId);
  if (!intern) {
    return next(new ErrorResponse('Intern not found', 404));
  }

  // Check if company exists
  const company = await Company.findById(companyId);
  if (!company) {
    return next(new ErrorResponse('Company not found', 404));
  }

  // Check if intern has been employed by the company
  const employment = await CompanyIntern.findOne({
    company: companyId,
    intern: internId,
    status: 'terminated' // Only allow reviews after employment ends
  });

  if (!employment) {
    return next(new ErrorResponse('Not authorized to review this company', 403));
  }

  // Create or update review
  let review = await Review.findOneAndUpdate(
    {
      reviewer: internId,
      target: companyId,
      direction: 'intern_to_company',
      targetModel: 'Company'
    },
    {
      rating,
      content: feedback,
      status: 'approved',
      $setOnInsert: {
        reviewer: internId,
        target: companyId,
        direction: 'intern_to_company',
        targetModel: 'Company'
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: review
  });
});

exports.getReviewsAboutMe = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ target: req.user.id })
    .populate({
      path: 'reviewer',
      select: 'name avatar role',
      populate: {
        path: 'role',
        select: 'name'
      }
    })
    .populate('job', 'title company');

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
    : 0;

  res.status(200).json({
    success: true,
    count: reviews.length,
    averageRating: parseFloat(avgRating.toFixed(1)),
    data: reviews
  });
});

/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 */

exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({})
    .populate('reviewer', 'name')
    .populate('job', 'title')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
  });