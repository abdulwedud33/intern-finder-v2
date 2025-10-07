const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Review = require('../models/Review');
const CompanyReview = require('../models/CompanyReview');
const InternReview = require('../models/InternReview');
const CompanyIntern = require('../models/CompanyIntern');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Clean up all data from database
 * @route   DELETE /api/v1/cleanup
 * @access  Private (Admin only)
 */
exports.cleanupDatabase = asyncHandler(async (req, res, next) => {
  try {
    console.log('Starting database cleanup...');
    
    // Delete all documents from all collections
    await User.deleteMany({});
    console.log('✅ Deleted all users');
    
    await Job.deleteMany({});
    console.log('✅ Deleted all jobs');
    
    await Application.deleteMany({});
    console.log('✅ Deleted all applications');
    
    await Interview.deleteMany({});
    console.log('✅ Deleted all interviews');
    
    await Review.deleteMany({});
    console.log('✅ Deleted all reviews');
    
    await CompanyReview.deleteMany({});
    console.log('✅ Deleted all company reviews');
    
    await InternReview.deleteMany({});
    console.log('✅ Deleted all intern reviews');
    
    await CompanyIntern.deleteMany({});
    console.log('✅ Deleted all company-intern relationships');
    
    res.status(200).json({
      success: true,
      message: 'Database cleanup completed successfully! You can now start fresh.'
    });
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup database'
    });
  }
});
