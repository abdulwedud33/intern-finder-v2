const CompanyIntern = require('../models/CompanyIntern');
const Company = require('../models/Company');
const Intern = require('../models/Intern');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get companies the intern has worked with
 * @route   GET /api/v1/intern-companies
 * @access  Private (Intern)
 */
exports.getInternCompanies = asyncHandler(async (req, res, next) => {
  const internId = req.user.id;

  // Validate internId
  if (!internId) {
    return next(new ErrorResponse('Intern ID not found', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(internId)) {
    return next(new ErrorResponse('Invalid intern ID format', 400));
  }

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
  const internId = req.user.id;

  // Validate internId
  if (!internId) {
    return next(new ErrorResponse('Intern ID not found', 400));
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(internId)) {
    return next(new ErrorResponse('Invalid intern ID format', 400));
  }

  try {
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

    // Get additional stats
    const companies = await CompanyIntern.find({ intern: internId })
      .populate('company', 'name industry')
      .select('skills startDate endDate achievements');

    // Calculate total experience in months
    let totalExperience = 0;
    companies.forEach(company => {
      const startDate = new Date(company.startDate);
      const endDate = company.endDate ? new Date(company.endDate) : new Date();
      const months = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
      totalExperience += Math.max(0, months);
    });

    // Extract skills gained
    const skillsSet = new Set();
    companies.forEach(company => {
      if (company.skills && company.skills.length > 0) {
        company.skills.forEach(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          skillsSet.add(skillName);
        });
      }
    });
    const skillsGained = Array.from(skillsSet);

    // Extract industries
    const industryMap = new Map();
    companies.forEach(company => {
      const industry = company.company?.industry || 'Other';
      if (industryMap.has(industry)) {
        industryMap.set(industry, industryMap.get(industry) + 1);
      } else {
        industryMap.set(industry, 1);
      }
    });
    const industries = Array.from(industryMap.entries()).map(([name, count]) => ({
      name,
      count,
      duration: 0 // Could be calculated if needed
    }));

    // Generate monthly timeline
    const monthlyTimeline = companies.map(company => ({
      month: new Date(company.startDate).toISOString().slice(0, 7), // YYYY-MM format
      company: company.company?.name || 'Unknown Company',
      position: 'Position', // Could be populated from job if available
      status: company.status || 'completed'
    }));

    // Extract achievements
    const achievements = [];
    companies.forEach(company => {
      if (company.achievements && company.achievements.length > 0) {
        company.achievements.forEach(achievement => {
          achievements.push({
            category: achievement.category || 'general',
            count: 1
          });
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalCompanies,
        totalExperience,
        averageRating: averageRating[0]?.averageRating?.toFixed(1) || 0,
        completedInternships: terminatedCompanies,
        activeInternships: activeCompanies,
        skillsGained,
        industries,
        monthlyTimeline,
        achievements
      }
    });
  } catch (error) {
    console.error('Error in getInternStats:', error);
    return next(new ErrorResponse('Failed to fetch intern statistics', 500));
  }
});

/**
 * @desc    Get details of a specific company relationship
 * @route   GET /api/v1/intern-companies/:companyId
 * @access  Private (Intern)
 */
exports.getCompanyRelationship = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const internId = req.user.id;

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

/**
 * @desc    Get work history timeline
 * @route   GET /api/v1/intern-companies/timeline
 * @access  Private (Intern)
 */
exports.getWorkHistoryTimeline = asyncHandler(async (req, res, next) => {
  const internId = req.user.id;

  const companies = await CompanyIntern.find({ intern: internId })
    .populate('company', 'name')
    .populate('job', 'title')
    .sort({ startDate: -1 });

  const timeline = companies.map(company => ({
    date: company.startDate,
    company: company.company.name,
    position: company.job.title,
    status: company.status,
    duration: company.endDate 
      ? `${Math.round((new Date(company.endDate) - new Date(company.startDate)) / (1000 * 60 * 60 * 24 * 30))} months`
      : 'Ongoing',
    rating: company.performance?.rating || null
  }));

  res.status(200).json({
    success: true,
    data: timeline
  });
});

/**
 * @desc    Get achievements
 * @route   GET /api/v1/intern-companies/achievements
 * @access  Private (Intern)
 */
exports.getAchievements = asyncHandler(async (req, res, next) => {
  const internId = req.user.id;

  const companies = await CompanyIntern.find({ intern: internId })
    .populate('company', 'name')
    .select('achievements company');

  const achievements = [];
  companies.forEach(company => {
    if (company.achievements && company.achievements.length > 0) {
      company.achievements.forEach(achievement => {
        achievements.push({
          title: achievement.title,
          description: achievement.description,
          date: achievement.date,
          company: company.company.name,
          category: achievement.category,
          verified: achievement.verified || false
        });
      });
    }
  });

  res.status(200).json({
    success: true,
    data: achievements
  });
});

/**
 * @desc    Get skills gained
 * @route   GET /api/v1/intern-companies/skills
 * @access  Private (Intern)
 */
exports.getSkillsGained = asyncHandler(async (req, res, next) => {
  const internId = req.user.id;

  const companies = await CompanyIntern.find({ intern: internId })
    .populate('company', 'name')
    .select('skills company startDate endDate');

  const skillMap = new Map();
  
  companies.forEach(company => {
    if (company.skills && company.skills.length > 0) {
      company.skills.forEach(skill => {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        if (!skillMap.has(skillName)) {
          skillMap.set(skillName, {
            name: skillName,
            level: typeof skill === 'object' ? skill.level : 'intermediate',
            verified: typeof skill === 'object' ? skill.verified : false,
            companies: [],
            lastUsed: company.startDate
          });
        }
        skillMap.get(skillName).companies.push(company.company.name);
        if (company.startDate > skillMap.get(skillName).lastUsed) {
          skillMap.get(skillName).lastUsed = company.startDate;
        }
      });
    }
  });

  const skills = Array.from(skillMap.values());

  res.status(200).json({
    success: true,
    data: skills
  });
});

/**
 * @desc    Get performance history
 * @route   GET /api/v1/intern-companies/performance
 * @access  Private (Intern)
 */
exports.getPerformanceHistory = asyncHandler(async (req, res, next) => {
  const internId = req.user.id;

  // Validate internId
  if (!internId) {
    return next(new ErrorResponse('Intern ID not found', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(internId)) {
    return next(new ErrorResponse('Invalid intern ID format', 400));
  }

  try {
    // Get reviews with minimal population to avoid errors
    const reviews = await Review.find({ 
      target: internId, 
      targetModel: 'Intern' 
    })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    const performance = reviews.map(review => ({
      company: 'Company', // Simplified for now
      position: 'Position', // Simplified for now
      rating: review.rating,
      feedback: review.content,
      date: review.createdAt,
      reviewer: review.reviewer?.name || 'Anonymous'
    }));

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error in getPerformanceHistory:', error);
    return next(new ErrorResponse('Failed to fetch performance history', 500));
  }
});

/**
 * @desc    Get recommendations
 * @route   GET /api/v1/intern-companies/recommendations
 * @access  Private (Intern)
 */
exports.getRecommendations = asyncHandler(async (req, res, next) => {
  const internId = req.user.id;

  // For now, return empty array since we don't have a separate recommendations model
  // This could be enhanced to extract recommendations from reviews or create a separate model
  const recommendations = [];

  res.status(200).json({
    success: true,
    data: recommendations
  });
});

module.exports = exports;
