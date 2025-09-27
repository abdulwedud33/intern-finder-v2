const CompanyIntern = require('../models/CompanyIntern');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all company interns
// @route   GET /api/company-interns
// @access  Private/Company
const getCompanyInterns = asyncHandler(async (req, res, next) => {
  const companyInterns = await CompanyIntern.find({ company: req.user.company })
    .populate({
      path: 'intern',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title');

  res.status(200).json({
    success: true,
    count: companyInterns.length,
    data: companyInterns
  });
});

// @desc    Get company intern statistics
// @route   GET /api/company-interns/stats
// @access  Private/Company
const getCompanyInternStats = asyncHandler(async (req, res, next) => {
  const stats = await CompanyIntern.aggregate([
    {
      $match: { company: req.user.company }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statsObj = stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      totalInterns: stats.reduce((acc, curr) => acc + curr.count, 0),
      activeInterns: statsObj.active || 0,
      terminatedInterns: statsObj.terminated || 0
    }
  });
});

// @desc    Search and filter company interns
// @route   GET /api/company-interns/search
// @access  Private/Company
const searchCompanyInterns = asyncHandler(async (req, res, next) => {
  const { query, status } = req.query;
  
  // Build match object
  const match = { company: req.user.company };
  
  if (status) {
    match.status = status;
  }
  
  if (query) {
    match.$or = [
      { 'intern.user.name': { $regex: query, $options: 'i' } },
      { 'intern.user.email': { $regex: query, $options: 'i' } }
    ];
  }

  const companyInterns = await CompanyIntern.find(match)
    .populate({
      path: 'intern',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title');

  res.status(200).json({
    success: true,
    count: companyInterns.length,
    data: companyInterns
  });
});

// @desc    Get company intern by ID
// @route   GET /api/company-interns/:internId
// @access  Private/Company
const getCompanyInternById = asyncHandler(async (req, res, next) => {
  const companyIntern = await CompanyIntern.findOne({
    _id: req.params.internId,
    company: req.user.company
  })
    .populate({
      path: 'intern',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title');

  if (!companyIntern) {
    return next(
      new ErrorResponse(
        `No company intern found with id of ${req.params.internId}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: companyIntern
  });
});

// @desc    Update company intern status
// @route   PUT /api/company-interns/:internId/status
// @access  Private/Company
const updateCompanyInternStatus = asyncHandler(async (req, res, next) => {
  const { status, startDate, endDate } = req.body;

  let companyIntern = await CompanyIntern.findOne({
    _id: req.params.internId,
    company: req.user.company
  });

  if (!companyIntern) {
    return next(
      new ErrorResponse(
        `No company intern found with id of ${req.params.internId}`,
        404
      )
    );
  }

  // Update fields
  companyIntern.status = status || companyIntern.status;
  if (startDate) companyIntern.startDate = startDate;
  if (endDate) companyIntern.endDate = endDate;

  await companyIntern.save();

  res.status(200).json({
    success: true,
    data: companyIntern
  });
});

// @desc    Terminate company intern
// @route   PUT /api/company-interns/:internId/terminate
// @access  Private/Company
const terminateCompanyIntern = asyncHandler(async (req, res, next) => {
  const { reason, endDate } = req.body;

  let companyIntern = await CompanyIntern.findOne({
    _id: req.params.internId,
    company: req.user.company
  });

  if (!companyIntern) {
    return next(
      new ErrorResponse(
        `No company intern found with id of ${req.params.internId}`,
        404
      )
    );
  }

  // Update status to terminated
  companyIntern.status = 'terminated';
  companyIntern.endDate = endDate || Date.now();
  companyIntern.terminationReason = reason;

  await companyIntern.save();

  res.status(200).json({
    success: true,
    data: companyIntern
  });
});

module.exports = {
  getCompanyInterns,
  getCompanyInternStats,
  searchCompanyInterns,
  getCompanyInternById,
  updateCompanyInternStatus,
  terminateCompanyIntern
};
