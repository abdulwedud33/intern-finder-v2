const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const mongoose = require('mongoose');

// @desc    Get application statistics
// @route   GET /api/stats/applications
// @access  Private
exports.getApplicationStats = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  let query = {};

  // Filter by user role
  if (role === 'company') {
    // Get applications for company's jobs
    const jobs = await Job.find({ user: req.user.id }).select('_id');
    const jobIds = jobs.map(job => job._id);
    query = { jobId: { $in: jobIds } };
  } else if (role === 'intern') {
    // Get applications for current intern
    query = { internId: req.user.id };
  } else {
    return next(new ErrorResponse('Not authorized to view these stats', 403));
  }

  const stats = await Application.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Calculate response time in days
  const formattedStats = stats.map(stat => ({
    status: stat._id,
    count: stat.count,
    avgResponseDays: stat.avgResponseTime 
      ? Math.ceil(stat.avgResponseTime / (1000 * 60 * 60 * 24)) 
      : null
  }));

  res.status(200).json({
    success: true,
    data: formattedStats
  });
});

// @desc    Get interview statistics
// @route   GET /api/stats/interviews
// @access  Private
exports.getInterviewStats = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  let query = {};

  // Filter by user role
  if (role === 'company') {
    // Get interviews for company's applications
    const jobs = await Job.find({ user: req.user.id }).select('_id');
    const applications = await Application.find({ 
      jobId: { $in: jobs.map(job => job._id) } 
    }).select('_id');
    
    query = { 
      applicationId: { $in: applications.map(app => app._id) },
      scheduledBy: req.user.id
    };
  } else if (role === 'intern') {
    // Get interviews for current intern
    const applications = await Application.find({ internId: req.user.id }).select('_id');
    query = { applicationId: { $in: applications.map(app => app._id) } };
  } else {
    return next(new ErrorResponse('Not authorized to view these stats', 403));
  }

  const stats = await Interview.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgScheduledDays: { 
          $avg: { 
            $subtract: ['$date', '$createdAt'] 
          } 
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Calculate average scheduled days in the future
  const formattedStats = stats.map(stat => ({
    status: stat._id,
    count: stat.count,
    avgScheduledDays: stat.avgScheduledDays
      ? Math.ceil(stat.avgScheduledDays / (1000 * 60 * 60 * 24))
      : null
  }));

  res.status(200).json({
    success: true,
    data: formattedStats
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const { role, id: userId } = req.user;
  let stats = {};

  if (role === 'company') {
    // Get company's jobs
    const jobs = await Job.find({ user: userId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    // Get application counts
    const applicationCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          reviewed: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get interview counts
    const interviewCounts = await Interview.aggregate([
      { 
        $match: { 
          scheduledBy: new mongoose.Types.ObjectId(userId) 
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          scheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent applications
    const recentApplications = await Application.find({ 
      jobId: { $in: jobIds } 
    })
      .sort('-createdAt')
      .limit(5)
      .populate('internId', 'name email')
      .populate('jobId', 'title');

    stats = {
      applications: applicationCounts[0] || { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 },
      interviews: interviewCounts[0] || { total: 0, scheduled: 0, completed: 0, cancelled: 0 },
      recentApplications
    };

  } else if (role === 'intern') {
    // Get intern's applications
    const applicationCounts = await Application.aggregate([
      { $match: { internId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          reviewed: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get interview counts
    const interviewCounts = await Interview.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationId',
          foreignField: '_id',
          as: 'application'
        }
      },
      { $unwind: '$application' },
      { $match: { 'application.internId': new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          scheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get upcoming interviews
    const upcomingInterviews = await Interview.find({
      internId: userId,
      status: 'scheduled',
      date: { $gte: new Date() }
    })
      .sort('date')
      .limit(5)
      .populate({
        path: 'applicationId',
        populate: {
          path: 'jobId',
          select: 'title company'
        }
      });

    stats = {
      applications: applicationCounts[0] || { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 },
      interviews: interviewCounts[0] || { total: 0, scheduled: 0, completed: 0, cancelled: 0 },
      upcomingInterviews
    };
  } else {
    return next(new ErrorResponse('Not authorized to view these stats', 403));
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});
