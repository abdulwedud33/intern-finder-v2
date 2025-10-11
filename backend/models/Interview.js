const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Please add a job ID'],
    index: true
  },
  internId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add an intern ID'],
    index: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Please add an application ID'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Please add interview date']
  },
  // Alias for frontend compatibility
  scheduledDate: {
    type: Date,
    required: [true, 'Please add scheduled date']
  },
  type: {
    type: String,
    enum: ['phone', 'video', 'onsite', 'other'],
    default: 'video'
  },
  location: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [240, 'Duration cannot exceed 4 hours']
  },
  link: {
    type: String
  },
  note: {
    type: String,
    maxlength: [1000, 'Note cannot exceed 1000 characters']
  },
  // Alias for frontend compatibility
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  // Interviewer information
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Interview feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      maxlength: [1000, 'Comments cannot exceed 1000 characters']
    },
    strengths: [{
      type: String,
      maxlength: [200, 'Each strength cannot exceed 200 characters']
    }],
    improvements: [{
      type: String,
      maxlength: [200, 'Each improvement cannot exceed 200 characters']
    }],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date
    }
  },
  // Interview outcome
  outcome: {
    type: String,
    enum: ['passed', 'failed', 'pending'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying
InterviewSchema.index({ jobId: 1, internId: 1 });
InterviewSchema.index({ date: 1 });

// Reverse populate with virtuals
InterviewSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

InterviewSchema.virtual('intern', {
  ref: 'User',
  localField: 'internId',
  foreignField: '_id',
  justOne: true
});

InterviewSchema.virtual('application', {
  ref: 'Application',
  localField: 'applicationId',
  foreignField: '_id',
  justOne: true
});

// Update the updatedAt field before saving and sync date fields
InterviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Sync date and scheduledDate fields
  if (this.date && !this.scheduledDate) {
    this.scheduledDate = this.date;
  } else if (this.scheduledDate && !this.date) {
    this.date = this.scheduledDate;
  }
  
  // Sync note and notes fields
  if (this.note && !this.notes) {
    this.notes = this.note;
  } else if (this.notes && !this.note) {
    this.note = this.notes;
  }
  
  next();
});

// Prevent duplicate interviews for the same application and date
InterviewSchema.index({ applicationId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Interview', InterviewSchema);
