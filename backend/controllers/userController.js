const { User } = require('../models/User');
const Intern = require('../models/Intern');
const Company = require('../models/Company');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all users (both interns and companies)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    // Get all interns
    const interns = await Intern.find().select('-password');
    
    // Get all companies
    const companies = await Company.find().select('-password');
    
    // Combine the results
    const users = {
      interns,
      companies,
      total: interns.length + companies.length
    };
    
    res.status(200).json({
      success: true,
      count: users.total,
      data: users
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @desc    Search companies by name
 * @route   GET /api/companies/search
 * @access  Public
 */
exports.searchCompanies = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return next(new ErrorResponse('Please provide a company name to search for', 400));
    }
    
    // Create a case-insensitive regex for the search
    const regex = new RegExp(name, 'i');
    
    // Search for companies with matching name (case-insensitive)
    const companies = await Company.find({
      name: { $regex: regex }
    }).select('-password');
    
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (err) {
    next(err);
  }
});
