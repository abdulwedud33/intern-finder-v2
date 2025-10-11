const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Company = require('../models/Company');
const { User } = require('../models/User');
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
  
  // Add search functionality
  if (req.query.search) {
    queryObj.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Add location search
  if (req.query.location) {
    queryObj.headquarters = { $regex: req.query.location, $options: 'i' };
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  // Look for companies in the Company collection (standalone model)
  const companyResults = await Company.find(queryObj)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
    .sort('-createdAt');
  
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
    total: companyResults.length,
    pagination,
    data: paginatedCompanies
  });
});

// uploadCompanyLogo function removed - using Cloudinary uploads
