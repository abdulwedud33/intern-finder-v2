const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { User } = require('../models/User');
const Company = require('../models/Company');
const { isValidObjectId, Types } = require('mongoose');

/**
 * @desc    Schedule an interview
 * @route   POST /api/v1/interviews
 * @access  Private (Company)
 */
exports.scheduleInterview = asyncHandler(async (req, res, next) => {
  const { applicationId, scheduledDate, date, time, location, notes, note, link, meetingLink, interviewType = 'virtual', type = 'video', duration = 60 } = req.body;
  const userId = req.user.id;

  // Check if user is a company
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Only companies can schedule interviews', 403));
  }

  // Get company profile for the current user
  const company = await Company.findById(req.user.id);
  
  if (!company) {
    return next(new ErrorResponse('Company profile not found', 404));
  }

  // Check if application exists and belongs to company
  const application = await Application.findById(applicationId)
    .populate({
      path: 'jobId',
      select: 'companyId',
      populate: {
        path: 'companyId',
        select: '_id'
      }
    })
    .populate({
      path: 'internId',
      select: '_id'
    });

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Verify the company owns the job listing
  if (application.jobId.companyId._id.toString() !== company._id.toString()) {
    return next(new ErrorResponse('Not authorized to schedule interview for this application', 403));
  }

  // Handle both date formats (separate date/time or combined scheduledDate)
  let interviewDate;
  if (scheduledDate) {
    interviewDate = new Date(scheduledDate);
    console.log('Using scheduledDate:', scheduledDate, 'Parsed date:', interviewDate.toISOString());
  } else if (date && time) {
    interviewDate = new Date(`${date}T${time}`);
    console.log('Using date+time:', date, time, 'Parsed date:', interviewDate.toISOString());
  } else {
    return next(new ErrorResponse('Interview date is required', 400));
  }
  
  if (interviewDate < new Date()) {
    return next(new ErrorResponse('Interview date must be in the future', 400));
  }

  // Check for scheduling conflicts
  const existingInterview = await Interview.findOne({
    $or: [
      { 'applicationId': applicationId, status: { $ne: 'cancelled' } },
      { 
        $and: [
          { 'internId': application.internId._id },
          { date: interviewDate },
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
    internId: application.internId._id,
    jobId: application.jobId._id,
    interviewer: userId,
    date: interviewDate,
    scheduledDate: interviewDate, // Sync with frontend
    time: time || interviewDate.toTimeString().split(' ')[0], // Extract time if not provided
    location,
    link: link || meetingLink, // Store exactly as user inputted
    notes: notes || note, // Handle both field names
    note: notes || note, // Handle both field names
    type: type || interviewType,
    duration: duration,
    status: 'scheduled'
  });

  // Populate the response
  const populatedInterview = await Interview.findById(interview._id)
    .populate({
      path: 'jobId',
      select: 'title description companyId',
      populate: {
        path: 'companyId',
        select: 'name logo'
      }
    })
    .populate({
      path: 'internId',
      select: 'firstName lastName avatar'
    })
    .populate('applicationId', 'status');

  // Update application status
  application.status = 'interview';
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
  
  console.log('getCompanyInterviews - req.user:', {
    id: req.user._id,
    role: req.user.role,
    name: req.user.name
  });
  
  // Get all interviews created by this company (where interviewer is the company)
  console.log('Querying interviews with interviewer:', req.user._id, 'Type:', typeof req.user._id);
  
  // Debug: Check if ANY interviews exist at all
  const totalInterviews = await Interview.countDocuments()
  console.log('Total interviews in database:', totalInterviews)
  
  // Try multiple query approaches
  const interviews = await Interview.find({ 
    $or: [
      { interviewer: req.user._id },
      { interviewer: req.user._id.toString() },
      { interviewer: new Types.ObjectId(req.user._id) }
    ]
  })
    .populate({
      path: 'jobId',
      select: 'title description',
      populate: {
        path: 'companyId',
        select: 'name logo'
      }
    })
    .populate({
      path: 'internId',
      select: 'name email avatar'
    })
    .populate('applicationId', 'status')
    .sort('-createdAt');
    
  // Transform the data to match frontend expectations
  const transformedInterviews = interviews.map(interview => ({
    ...interview.toObject(),
    job: interview.jobId,
    company: interview.jobId?.companyId,
    meetingLink: interview.link,
    notes: interview.notes || interview.note
  }));
  
  console.log('getCompanyInterviews - interviews found:', interviews.length);
    
  res.status(200).json({
    success: true,
    count: transformedInterviews.length,
    data: transformedInterviews
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
  
  // Get all interviews for applications submitted by this intern
  const Application = require('../models/Application');
  const internApplications = await Application.find({ internId: req.user._id }).select('_id');
  const applicationIds = internApplications.map(app => app._id);
  
  // Get all interviews for these applications
  const interviews = await Interview.find({ applicationId: { $in: applicationIds } })
    .populate({
      path: 'jobId',
      select: 'title description',
      populate: {
        path: 'companyId',
        select: 'name logo'
      }
    })
    .populate({
      path: 'internId',
      select: 'name email avatar'
    })
    .populate('applicationId', 'status')
    .sort('-date');
    
  // Transform the data to match frontend expectations
  const transformedInterviews = interviews.map(interview => ({
    ...interview.toObject(),
    job: interview.jobId,
    company: interview.jobId?.companyId,
    meetingLink: interview.link || interview.meetingLink || '',
    notes: interview.notes || interview.note
    // Keep scheduledDate exactly as stored (don't override)
  }));
    
  res.status(200).json({
    success: true,
    count: transformedInterviews.length,
    data: transformedInterviews
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
      path: 'jobId',
      select: 'title description',
      populate: {
        path: 'companyId',
        select: 'name logo'
      }
    })
    .populate({
      path: 'internId',
      select: 'name email avatar'
    })
    .populate('applicationId', 'status');
    
  if (!interview) {
    return next(new ErrorResponse('Interview not found', 404));
  }
  
  // Check if user is authorized to view this interview
  if (req.user.role === 'company') {
    // Check if this interview belongs to one of the company's applications
    const Application = require('../models/Application');
    const application = await Application.findById(interview.applicationId);
    if (!application || application.companyId.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to view this interview', 403));
    }
  } else if (req.user.role === 'intern') {
    if (interview.internId.toString() !== req.user._id.toString()) {
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
      path: 'jobId',
      select: 'user'
    })
    .populate({
      path: 'internId',
      select: 'user'
    });
    
  if (!interview) {
    return next(new ErrorResponse('Interview not found', 404));
  }
  
  // Check if user is authorized to update this interview
  let isAuthorized = false;
  
  if (req.user.role === 'company') {
    const company = await Company.findById(req.user.id);
    isAuthorized = company && interview.company._id.toString() === company._id.toString();
  } else if (req.user.role === 'intern') {
    const intern = await User.findOne({ _id: req.user.id, role: 'intern' });
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
      path: 'jobId',
      select: 'name logo',
      populate: {
        path: 'companyId',
        select: 'name email'
      }
    })
    .populate({
      path: 'internId',
      select: 'firstName lastName avatar',
      populate: {
        path: 'companyId',
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
  const company = await Company.findById(req.user.id);
  
  if (!company) {
    return next(new ErrorResponse('Company profile not found', 404));
  }
  
  // Find the interview
  const interview = await Interview.findById(id)
    .populate('job', 'title')
    .populate({
      path: 'internId',
      select: 'user',
      populate: {
        path: 'companyId',
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
      path: 'jobId',
      select: 'name logo',
      populate: {
        path: 'companyId',
        select: 'name email'
      }
    })
    .populate({
      path: 'internId',
      select: 'firstName lastName avatar',
      populate: {
        path: 'companyId',
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
      path: 'applicationId',
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
 * @desc    Get all interviews for a company by ID (admin/company view)
 * @route   GET /api/v1/companies/:companyId/interviews
 * @access  Private (Company, Admin)
 */
exports.getCompanyInterviewsById = asyncHandler(async (req, res, next) => {
  // Check if user is authorized (admin or company owner)
  if (req.user.role !== 'admin' && 
      (req.user.role !== 'company' || req.user._id.toString() !== req.params.companyId)) {
    return next(new ErrorResponse('Not authorized to access these interviews', 403));
  }

  const interviews = await Interview.find({ company: req.params.companyId })
    .populate({
      path: 'internId',
      select: 'user',
      populate: {
        path: 'companyId',
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

/**
 * @desc    Get all interviews for a company
 * @route   GET /api/v1/interviews/company
 * @access  Private (Company)
 */
exports.getCompanyInterviews = asyncHandler(async (req, res, next) => {
  // Get all interviews for this company
  const interviews = await Interview.find({ company: req.user.id })
    .populate({
      path: 'internId',
      select: 'name email avatar',
      populate: {
        path: 'companyId',
        select: 'name email'
      }
    })
    .populate({
      path: 'jobId',
      select: 'name logo',
      populate: {
        path: 'companyId',
        select: 'name email'
      }
    })
    .populate('job', 'title companyName')
    .populate('application', 'status')
    .sort('-scheduledDate');
    
  res.status(200).json({
    success: true,
    count: interviews.length,
    data: interviews
  });
});

/**
 * @desc    Get interviews for a specific company by ID
 * @route   GET /api/v1/interviews/companies/:companyId/interviews
 * @access  Private (Company, Admin)
 */
exports.getCompanyInterviewsById = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  
  // Check if the company exists
  const company = await Company.findById(companyId);
  if (!company) {
    return next(new ErrorResponse('Company not found', 404));
  }
  
  // Get all interviews for this company
  const interviews = await Interview.find({ company: companyId })
    .populate({
      path: 'internId',
      select: 'name email avatar',
      populate: {
        path: 'companyId',
        select: 'name email'
      }
    })
    .populate({
      path: 'jobId',
      select: 'name logo',
      populate: {
        path: 'companyId',
        select: 'name email'
      }
    })
    .populate('job', 'title companyName')
    .populate('application', 'status')
    .sort('-scheduledDate');
    
  res.status(200).json({
    success: true,
    count: interviews.length,
    data: interviews
  });
});
