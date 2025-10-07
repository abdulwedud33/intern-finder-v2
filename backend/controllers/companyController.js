const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Company = require('../models/Company');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get company profile
 * @route   GET /api/v1/companies/me
 * @access  Private (Company)
 */
exports.getCompanyProfile = asyncHandler(async (req, res, next) => {
  // Since Company is now standalone, we can directly use req.user
  const company = await Company.findById(req.user._id)
    .select('-password -resetPasswordToken -resetPasswordExpire');

  if (!company) {
    return next(new ErrorResponse('Company profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

/**
 * @desc    Get public company profile by ID
 * @route   GET /api/v1/companies/:id
 * @access  Public
 */
exports.getCompanyById = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerified -emailVerificationToken -emailVerificationExpire');

  if (!company) {
    return next(new ErrorResponse('Company not found', 404));
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

/**
 * @desc    Create or update company profile
 * @route   PUT /api/v1/companies/me
 * @access  Private (Company)
 */
exports.updateCompanyProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Not authorized to update company profile', 403));
  }

  const {
    name,
    description,
    website,
    industry,
    companySize,
    founded,
    headquarters,
    logo,
    coverPhoto,
    socialMedia,
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    ...otherFields
  } = req.body;

  // Find the company
  let company = await Company.findById(req.user._id);

  if (!company) {
    return next(new ErrorResponse('Company not found', 404));
  }

  // Update fields
  if (name) company.name = name;
  if (description) company.description = description;
  if (website) company.website = website;
  if (industry) company.industry = industry;
  if (companySize) company.companySize = companySize;
  if (founded) company.foundedYear = founded;
  if (headquarters) company.headquarters = headquarters;
  if (logo) company.logo = logo;
  if (socialMedia) company.socialMedia = socialMedia;
  if (phone) company.phone = phone;

  // Update any other fields that were passed in
  Object.keys(otherFields).forEach(key => {
    if (key in company.schema.paths) {
      company[key] = otherFields[key];
    }
  });

  await company.save();

  res.status(200).json({
    success: true,
    data: company
  });
});


/**
 * @desc    Get all companies
 * @route   GET /api/companies
 * @access  Public
 */
exports.getCompanies = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Parse query and add role filter for companies
  let queryObj = JSON.parse(queryStr);
  queryObj.role = 'company';
  
  // Look for companies in the Company collection (standalone model)
  const companyResults = await Company.find(queryObj)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');
  
  // If we found companies, return them
  if (companyResults.length > 0) {
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCompanies = companyResults.slice(startIndex, endIndex);
    
    // Pagination result
    const pagination = {};
    if (endIndex < companyResults.length) {
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
      count: paginatedCompanies.length,
      pagination,
      data: paginatedCompanies
    });
    return;
  }

  let query = Company.find(queryObj)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

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
  const total = await Company.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const companies = await query;

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
    count: companies.length,
    pagination,
    data: companies
  });
});

/**
 * @desc    Upload company logo
 * @route   PUT /api/v1/companies/me/logo
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

  // Create custom filename with timestamp to avoid conflicts
  const timestamp = Date.now();
  const fileExtension = path.parse(file.name).ext;
  const filename = `logo_${req.user.id}_${timestamp}${fileExtension}`;

  // Create uploads directory if it doesn't exist
  const uploadPath = process.env.FILE_UPLOAD_PATH || './public/uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  try {
    // Upload file using async/await
    await file.mv(`${uploadPath}/${filename}`);

    // Update company logo
    const company = await Company.findByIdAndUpdate(
      req.user._id,
      { logo: filename },
      { new: true, runValidators: true }
    )
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    res.status(200).json({
      success: true,
      data: company,
      message: 'Company logo uploaded successfully'
    });
  } catch (err) {
    console.error('File upload error:', err);
    return next(new ErrorResponse('Problem with file upload', 500));
  }
});
