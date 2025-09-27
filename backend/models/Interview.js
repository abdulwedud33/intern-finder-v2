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
    ref: 'Intern',
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
  confirmed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
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
  ref: 'Intern',
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

// Update the updatedAt field before saving
InterviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent duplicate interviews for the same application and date
InterviewSchema.index({ applicationId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Interview', InterviewSchema);
