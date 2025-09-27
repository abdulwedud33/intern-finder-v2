const CompanyIntern = require('../models/CompanyIntern');
const Company = require('../models/Company');
const Intern = require('../models/Intern');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get companies the intern has worked with
 * @route   GET /api/v1/intern-companies
 * @access  Private (Intern)
 */
exports.getInternCompanies = asyncHandler(async (req, res, next) => {
  const internId = req.user.intern;

  const companies = await CompanyIntern.find({ intern: internId })
    .populate('company', 'name logo industry')
    .populate('job', 'title');

  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});

/**
 * @desc    Get intern's statistics
 * @route   GET /api/v1/intern-companies/stats
 * @access  Private (Intern)
 */
exports.getInternStats = asyncHandler(async (req, res, next) => {
  const internId = req.user.intern;

  const [
    totalCompanies,
    activeCompanies,
    terminatedCompanies,
    averageRating
  ] = await Promise.all([
    CompanyIntern.countDocuments({ intern: internId }),
    CompanyIntern.countDocuments({ intern: internId, status: 'active' }),
    CompanyIntern.countDocuments({ intern: internId, status: 'terminated' }),
    Review.aggregate([
      {
        $match: {
          target: new mongoose.Types.ObjectId(internId),
          targetModel: 'Intern'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalCompanies,
      activeCompanies,
      terminatedCompanies,
      averageRating: averageRating[0]?.averageRating?.toFixed(1) || 0
    }
  });
});

/**
 * @desc    Get details of a specific company relationship
 * @route   GET /api/v1/intern-companies/:companyId
 * @access  Private (Intern)
 */
exports.getCompanyRelationship = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const internId = req.user.intern;

  const relationship = await CompanyIntern.findOne({
    company: companyId,
    intern: internId
  })
    .populate('company', 'name logo industry description')
    .populate('job', 'title description');

  if (!relationship) {
    return next(
      new ErrorResponse(
        `No relationship found with company id ${companyId}`,
        404
      )
    );
  }

  // Get company reviews
  const reviews = await Review.find({
    target: companyId,
    targetModel: 'Company',
    direction: 'intern_to_company'
  })
    .populate('reviewer', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      relationship,
      reviews
    }
  });
});

module.exports = exports;
