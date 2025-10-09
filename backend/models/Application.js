const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Please add a job ID'],
    index: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a company ID'],
    index: true
  },
  internId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add an intern ID'],
    index: true
  },
  resume: {
    type: String
  },
  coverLetter: {
    type: String,
    required: [true, 'Please add a cover letter']
  },
  status: {
    type: String,
    enum: ['under_review', 'interview', 'accepted', 'rejected'],
    default: 'under_review'
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

// Prevent duplicate applications
ApplicationSchema.index({ jobId: 1, internId: 1 }, { unique: true });

// Reverse populate with virtuals
ApplicationSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('company', {
  ref: 'User',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('intern', {
  ref: 'User',
  localField: 'internId',
  foreignField: '_id',
  justOne: true
});

// Update the updatedAt field before saving
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cascade delete related interviews when an application is deleted
ApplicationSchema.pre('remove', async function(next) {
  await this.model('Interview').deleteMany({ applicationId: this._id });
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
