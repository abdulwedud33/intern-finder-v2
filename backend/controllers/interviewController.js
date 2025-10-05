const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const Company = require('../models/Company');
const { isValidObjectId } = require('mongoose');

/**
 * @desc    Schedule an interview
 * @route   POST /api/v1/interviews
 * @access  Private (Company)
 */
exports.scheduleInterview = asyncHandler(async (req, res, next) => {
  const { applicationId, date, time, location, notes, interviewType = 'virtual' } = req.body;
  const userId = req.user.id;

  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Only companies can schedule interviews', 403));
  }

  // Get company profile for the current user
  const company = await User.findOne({ user: req.user.id, role: 'company' });
  
  if (!company) {
    return next(new ErrorResponse('Company profile not found', 404));
  }

  // Check if application exists and belongs to company
  const application = await Application.findById(applicationId)
    .populate({
      path: 'job',
      select: 'company',
      populate: {
        path: 'company',
        select: '_id'
      }
    })
    .populate({
      path: 'intern',
      select: '_id',
      populate: {
        path: 'user',
        select: '_id'
      }
    });

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Verify the company owns the job listing
  if (application.job.company._id.toString() !== company._id.toString()) {
    return next(new ErrorResponse('Not authorized to schedule interview for this application', 403));
  }

  // Validate interview date
  const interviewDate = new Date(`${date}T${time}`);
  if (interviewDate < new Date()) {
    return next(new ErrorResponse('Interview date must be in the future', 400));
  }

  // Check for scheduling conflicts
  const existingInterview = await Interview.findOne({
    $or: [
      { 'application': applicationId, status: { $ne: 'cancelled' } },
      { 
        $and: [
          { 'application.intern': application.intern._id },
          { date: new Date(date) },
          { status: { $ne: 'cancelled' } }
        ]
      }
    ]
  });

  if (existingInterview) {
    return next(new ErrorResponse('An interview is already scheduled for this application or intern on this date', 400));
  }

  const interview = await Interview.create({
    applicationId: applicationId,
    companyId: application.job.company._id,
    internId: application.intern._id,
    jobId: application.job._id,
    interviewer: userId,
    date,
    scheduledDate: date, // Sync with frontend
    time,
    location,
    notes: notes || note, // Handle both field names
    note: notes || note, // Handle both field names
    type: interviewType,
    status: 'scheduled'
  });

  // Populate the response
  const populatedInterview = await Interview.findById(interview._id)
    .populate({
      path: 'company',
      select: 'name logo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'intern',
      select: 'firstName lastName avatar',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title')
    .populate('application', 'status');

  // Update application status
  application.status = 'interview_scheduled';
  await application.save();

  // TODO: Send email notification to intern about the scheduled interview

  res.status(201).json({
    success: true,
    data: populatedInterview
  });
});

/**
 * @desc    Get all interviews for a company
 * @route   GET /api/v1/interviews/company
 * @access  Private (Company)
 */
exports.getCompanyInterviews = asyncHandler(async (req, res, next) => {
  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Only companies can access this resource', 403));
  }
  
  // Get company profile for the current user
  const company = await User.findOne({ user: req.user.id, role: 'company' });
  
  if (!company) {
    return next(new ErrorResponse('Company profile not found', 404));
  }
  
  // Get all interviews for this company
  const interviews = await Interview.find({ company: company._id })
    .populate({
      path: 'company',
      select: 'name logo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'intern',
      select: 'firstName lastName avatar',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title')
    .populate('application', 'status')
    .sort('-createdAt');
    
  res.status(200).json({
    success: true,
    count: interviews.length,
    data: interviews
  });
});

/**
 * @desc    Get all interviews for an intern
 * @route   GET /api/v1/interviews/me
 * @access  Private (Intern)
 */
exports.getMyInterviews = asyncHandler(async (req, res, next) => {
  // Check if user is an intern
  if (req.user.role !== 'intern') {
    return next(new ErrorResponse('Only interns can access this resource', 403));
  }
  
  // Get intern profile for the current user
  const intern = await User.findOne({ user: req.user.id, role: 'intern' });
  
  if (!intern) {
    return next(new ErrorResponse('Intern profile not found', 404));
  }
  
  // Get all interviews for this intern
  const interviews = await Interview.find({ intern: intern._id })
    .populate({
      path: 'company',
      select: 'name logo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'intern',
      select: 'firstName lastName avatar',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title')
    .populate('application', 'status')
    .sort('-date -time');
    
  res.status(200).json({
    success: true,
    count: interviews.length,
    data: interviews
  });
});

/**
 * @desc    Get interview by ID
 * @route   GET /api/v1/interviews/:id
 * @access  Private
 */
exports.getInterview = asyncHandler(async (req, res, next) => {
  const interview = await Interview.findById(req.params.id)
    .populate({
      path: 'company',
      select: 'name logo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'intern',
      select: 'firstName lastName avatar',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title')
    .populate('application', 'status');
    
  if (!interview) {
    return next(new ErrorResponse('Interview not found', 404));
  }
  
  // Check if user is authorized to view this interview
  if (req.user.role === 'company') {
    const company = await User.findOne({ user: req.user.id, role: 'company' });
    if (!company || interview.company.toString() !== company._id.toString()) {
      return next(new ErrorResponse('Not authorized to view this interview', 403));
    }
  } else if (req.user.role === 'intern') {
    const intern = await User.findOne({ user: req.user.id, role: 'intern' });
    if (!intern || interview.intern.toString() !== intern._id.toString()) {
      return next(new ErrorResponse('Not authorized to view this interview', 403));
    }
  } else if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }
  
  res.status(200).json({
    success: true,
    data: interview
  });
});

/**
 * @desc    Update interview details
 * @route   PUT /api/v1/interviews/:id
 * @access  Private
 */
exports.updateInterview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { date, time, location, notes, status, interviewType } = req.body;
  
  let interview = await Interview.findById(id)
    .populate({
      path: 'company',
      select: 'user'
    })
    .populate({
      path: 'intern',
      select: 'user'
    });
    
  if (!interview) {
    return next(new ErrorResponse('Interview not found', 404));
  }
  
  // Check if user is authorized to update this interview
  let isAuthorized = false;
  
  if (req.user.role === 'company') {
    const company = await User.findOne({ user: req.user.id, role: 'company' });
    isAuthorized = company && interview.company._id.toString() === company._id.toString();
  } else if (req.user.role === 'intern') {
    const intern = await User.findOne({ user: req.user.id, role: 'intern' });
    isAuthorized = intern && interview.intern._id.toString() === intern._id.toString();
  } else if (req.user.role === 'admin') {
    isAuthorized = true;
  }
  
  if (!isAuthorized) {
    return next(new ErrorResponse('Not authorized to update this interview', 403));
  }
  
  // Update fields if provided
  if (date) interview.date = date;
  if (time) interview.time = time;
  if (location) interview.location = location;
  if (notes) interview.notes = notes;
  if (interviewType) interview.interviewType = interviewType;
  
  // Status transitions
  if (status) {
    // Only allow specific status transitions
    const validTransitions = {
      scheduled: ['rescheduled', 'in_progress', 'cancelled', 'completed'],
      rescheduled: ['scheduled', 'in_progress', 'cancelled', 'completed'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };
    
    if (validTransitions[interview.status].includes(status)) {
      interview.status = status;
      
      // Set timestamps for status changes
      if (status === 'in_progress') {
        interview.startedAt = interview.startedAt || new Date();
      } else if (status === 'completed') {
        interview.completedAt = new Date();
      } else if (status === 'cancelled') {
        interview.cancelledAt = new Date();
        interview.cancelledBy = req.user.id;
      }
    } else {
      return next(new ErrorResponse(`Invalid status transition from ${interview.status} to ${status}`, 400));
    }
  }
  
  await interview.save();
  
  // Populate the response
  const populatedInterview = await Interview.findById(interview._id)
    .populate({
      path: 'company',
      select: 'name logo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'intern',
      select: 'firstName lastName avatar',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title')
    .populate('application', 'status');
  
  // TODO: Send notification to the other party about the update
  
  res.status(200).json({
    success: true,
    data: populatedInterview
  });
});

/**
 * @desc    Submit interview feedback
 * @route   POST /api/v1/interviews/:id/feedback
 * @access  Private (Company)
 */
exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { 
    rating, 
    notes, 
    strengths, 
    areasForImprovement, 
    recommendation,
    isRecommendedForHire
  } = req.body;
  
  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Only companies can submit interview feedback', 403));
  }
  
  // Get company profile for the current user
  const company = await User.findOne({ user: req.user.id, role: 'company' });
  
  if (!company) {
    return next(new ErrorResponse('Company profile not found', 404));
  }
  
  // Find the interview
  const interview = await Interview.findById(id)
    .populate('job', 'title')
    .populate({
      path: 'intern',
      select: 'user',
      populate: {
        path: 'user',
        select: '_id'
      }
    });
    
  if (!interview) {
    return next(new ErrorResponse('Interview not found', 404));
  }
  
  // Verify the company owns this interview
  if (interview.company.toString() !== company._id.toString()) {
    return next(new ErrorResponse('Not authorized to submit feedback for this interview', 403));
  }
  
  // Check if feedback was already submitted
  if (interview.feedback) {
    return next(new ErrorResponse('Feedback already submitted for this interview', 400));
  }
  
  // Validate feedback data
  if (!rating || (rating < 1 || rating > 5)) {
    return next(new ErrorResponse('Please provide a valid rating between 1 and 5', 400));
  }
  
  if (!notes || !strengths || !areasForImprovement || recommendation === undefined) {
    return next(new ErrorResponse('Please provide all required feedback fields', 400));
  }
  
  // Update interview with feedback
  interview.feedback = {
    rating: parseInt(rating),
    notes,
    strengths,
    areasForImprovement,
    recommendation,
    isRecommendedForHire: recommendation === 'hire',
    submittedBy: req.user.id,
    submittedAt: new Date()
  };
  
  // Update interview status
  interview.status = 'completed';
  interview.completedAt = new Date();
  
  await interview.save();
  
  // Update application status based on recommendation
  const application = await Application.findOne({
    _id: interview.application,
    job: interview.job,
    intern: interview.intern
  });
  
  if (application) {
    if (recommendation === 'hire') {
      application.status = 'offer_pending';
      // TODO: Trigger offer creation workflow
    } else {
      application.status = 'rejected';
      application.rejectionReason = 'Based on interview feedback';
    }
    await application.save();
  }
  
  // Populate the response
  const populatedInterview = await Interview.findById(interview._id)
    .populate({
      path: 'company',
      select: 'name logo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'intern',
      select: 'firstName lastName avatar',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title')
    .populate('application', 'status');
  
  // TODO: Send notification to intern about the feedback
  
  res.status(200).json({
    success: true,
    data: populatedInterview
  });
});

/**
 * @desc    Delete an interview
 * @route   DELETE /api/v1/interviews/:id
 * @access  Private (Company)
 */
exports.deleteInterview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const interview = await Interview.findById(id)
    .populate({
      path: 'application',
      populate: {
        path: 'listing',
        select: 'user'
      }
    });

  if (!interview) {
    return next(new ErrorResponse('Interview not found', 404));
  }

  // Only the company that created the listing can delete the interview
  if (interview.application.listing.user.toString() !== userId) {
    return next(new ErrorResponse('Not authorized to delete this interview', 403));
  }

  await interview.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get all interviews for a company (admin/company view)
 * @route   GET /api/v1/companies/:companyId/interviews
 * @access  Private (Company, Admin)
 */
exports.getCompanyInterviews = asyncHandler(async (req, res, next) => {
  // Check if user is authorized (admin or company owner)
  if (req.user.role !== 'admin' && 
      (req.user.role !== 'company' || req.user.company.toString() !== req.params.companyId)) {
    return next(new ErrorResponse('Not authorized to access these interviews', 403));
  }

  const interviews = await Interview.find({ company: req.params.companyId })
    .populate({
      path: 'intern',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('job', 'title')
    .sort('-date -createdAt');

  res.status(200).json({
    success: true,
    count: interviews.length,
    data: interviews
  });
});
