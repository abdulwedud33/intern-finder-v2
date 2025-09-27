const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Company = require('../models/Company');
const User = require('../models/User');

/**
 * @desc    Get company profile
 * @route   GET /api/v1/companies/me
 * @access  Private (Company)
 */
exports.getCompanyProfile = asyncHandler(async (req, res, next) => {
  // Since Company is a discriminator of User, we can directly use req.user
  // and populate any additional fields if needed
  const company = await Company.findById(req.user.id)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .populate('interns', 'name email avatar');

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
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerified -status -role')
    .populate('interns', 'name avatar');

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

  // Find the company (which is a User with role=company)
  let company = await Company.findById(req.user.id);

  if (!company) {
    return next(new ErrorResponse('Company not found', 404));
  }

  // Update fields
  if (name) company.name = name;
  if (description) company.description = description;
  if (website) company.website = website;
  if (industry) company.industry = industry;
  if (companySize) company.companySize = companySize;
  if (founded) company.founded = founded;
  if (headquarters) company.headquarters = headquarters;
  if (logo) company.logo = logo;
  if (coverPhoto) company.coverPhoto = coverPhoto;
  if (socialMedia) company.socialMedia = socialMedia;
  if (phone) company.phone = phone;
  if (address) company.address = address;
  if (city) company.city = city;
  if (state) company.state = state;
  if (country) company.country = country;
  if (zipCode) company.zipCode = zipCode;

  // Update any other fields that were passed in
  Object.keys(otherFields).forEach(key => {
    if (key in company.schema.paths) {
      company[key] = otherFields[key];
    }
  });

  // Set the updatedAt timestamp
  company.updatedAt = Date.now();
  if (phone) company.contact.phone = phone;
  if (address) company.contact.address = address;
  if (city) company.contact.city = city;
  if (state) company.contact.state = state;
  if (country) company.contact.country = country;
  if (zipCode) company.contact.zipCode = zipCode;

  await company.save();

  // Update user's name if company name changed
  if (companyName) {
    await User.findByIdAndUpdate(req.user.id, { name: companyName });
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyById = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id)
    .populate('user', 'name email')
    .select('-interns'); // Don't expose intern list publicly

  if (!company) {
    return next(new ErrorResponse('Company not found', 404));
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Company.find(JSON.parse(queryStr)).select('-interns');

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
  const total = await Company.countDocuments(JSON.parse(queryStr));

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
