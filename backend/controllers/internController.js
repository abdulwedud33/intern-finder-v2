const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Intern = require('../models/Intern');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get current intern's profile
 * @route   GET /api/v1/interns/me
 * @access  Private (Intern)
 */
exports.getInternProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  const intern = await Intern.findById(req.user.id)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .populate('companies', 'name logo')
    .populate('applications', 'status appliedAt job');

  if (!intern) {
    return next(new ErrorResponse('Intern profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: intern
  });
});

/**
 * @desc    Get public intern profile by ID
 * @route   GET /api/v1/interns/:id
 * @access  Public
 */
exports.getInternById = asyncHandler(async (req, res, next) => {
  const intern = await Intern.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerified -status -role -resume')
    .populate('companies', 'name logo');

  if (!intern) {
    return next(new ErrorResponse('Intern not found', 404));
  }

  res.status(200).json({
    success: true,
    data: intern
  });
});

/**
 * @desc    Update intern profile
 * @route   PUT /api/v1/interns/me
 * @access  Private (Intern)
 */
exports.updateInternProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to update intern profile', 403));
  }

  const {
    name,
    headline,
    bio,
    location,
    website,
    github,
    linkedin,
    twitter,
    education,
    skills,
    experience,
    resume,
    ...otherFields
  } = req.body;

  // Find the intern (which is a User with role=intern)
  let intern = await Intern.findById(req.user.id);

  if (!intern) {
    return next(new ErrorResponse('Intern not found', 404));
  }

  // Update fields
  if (name) intern.name = name;
  if (headline) intern.headline = headline;
  if (bio) intern.bio = bio;
  if (location) intern.location = location;
  if (website) intern.website = website;
  if (github) intern.social.github = github;
  if (linkedin) intern.social.linkedin = linkedin;
  if (twitter) intern.social.twitter = twitter;
  if (education) intern.education = education;
  if (skills) intern.skills = skills;
  if (experience) intern.experience = experience;
  if (resume) intern.resume = resume;

  // Update any other fields that were passed in
  Object.keys(otherFields).forEach(key => {
    if (key in intern.schema.paths) {
      intern[key] = otherFields[key];
    }
  });

  // Set the updatedAt timestamp
  intern.updatedAt = Date.now();

  await intern.save();

  // Remove sensitive data before sending response
  intern = intern.toObject();
  delete intern.password;
  delete intern.resetPasswordToken;
  delete intern.resetPasswordExpire;

  res.status(200).json({
    success: true,
    data: intern
  });
});

/**
 * @desc    Upload intern profile picture
 * @route   PUT /api/v1/interns/me/photo
 * @access  Private (Intern)
 */
exports.uploadProfilePicture = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to update profile picture', 403));
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
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000; // 1MB default
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
      data: intern
    });
  });
});

/**
 * @desc    Upload intern resume
 * @route   PUT /api/v1/interns/me/resume
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

  // Make sure the file is a PDF
  if (file.mimetype !== 'application/pdf') {
    return next(new ErrorResponse('Please upload a PDF file', 400));
  }

  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 5000000; // 5MB default
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
      data: intern
    });
  });
});

/**
 * @desc    Get all interns
 * @route   GET /api/v1/interns
 * @access  Public
 */
exports.getInterns = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query, role: 'intern' };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Intern.find(JSON.parse(queryStr))
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerified -status -resume')
    .populate('companies', 'name logo');

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
  const total = await Intern.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const interns = await query;

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
    count: interns.length,
    pagination,
    data: interns
  });
});

/**
 * @desc    Get intern statistics
 * @route   GET /api/v1/interns/stats
 * @access  Private (Admin)
 */
exports.getInternStats = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  const stats = await Intern.aggregate([
    {
      $group: {
        _id: '$education.degree',
        count: { $sum: 1 },
        avgGPA: { $avg: '$education.gpa' },
        avgExperience: { $avg: { $size: '$experience' } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const totalInterns = await Intern.countDocuments();
  const totalCompanies = await Company.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      total: totalInterns,
      totalCompanies,
      stats
    }
  });
});

// @desc    Update intern profile
// @route   PUT /api/v1/interns/me
// @access  Private (Intern)
exports.updateInternProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Not authorized to update intern profile', 403));
  }

  const {
    firstName,
    lastName,
    headline,
    bio,
    location,
    website,
    github,
    linkedin,
    twitter,
    education,
    skills,
    experience,
    resume,
    profilePicture
  } = req.body;

  // Find the intern (which is a User with role=intern)
  let intern = await Intern.findById(req.user.id);

  if (!intern) {
    return next(new ErrorResponse('Intern not found', 404));
  }

  // Update fields
  const updateFields = {
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(headline && { headline }),
    ...(bio && { bio }),
    ...(location && { location }),
    ...(website && { website }),
    ...(education && { education }),
    ...(skills && { skills }),
    ...(experience && { experience }),
    ...(resume && { resume }),
    ...(profilePicture && { profilePicture }),
    social: {
      ...intern.social,
      ...(github && { github }),
      ...(linkedin && { linkedin }),
      ...(twitter && { twitter })
    },
    updatedAt: Date.now()
  };

  // Update intern
  intern = await Intern.findByIdAndUpdate(
    req.user.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  // Update user's name if changed
  if (firstName || lastName) {
    const newName = `${intern.firstName} ${intern.lastName}`.trim();
    await User.findByIdAndUpdate(req.user.id, { name: newName });
  }

  res.status(200).json({
    success: true,
    data: intern
  });
});

// @desc    Get intern by ID
// @route   GET /api/interns/:id
// @access  Public
exports.getInternById = asyncHandler(async (req, res, next) => {
  const intern = await Intern.findById(req.params.id)
    .populate('user', 'name email')
    .select('-companies'); // Don't expose company list publicly

  if (!intern) {
    return next(new ErrorResponse('Intern not found', 404));
  }

  res.status(200).json({
    success: true,
    data: intern
  });
});

// @desc    Get all interns
// @route   GET /api/interns
// @access  Public
exports.getInterns = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Intern.find(JSON.parse(queryStr)).select('-companies');

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
  const total = await Intern.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const interns = await query;

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
    count: interns.length,
    pagination,
    data: interns
  });
});
