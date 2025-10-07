const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Please add a company ID'],
    index: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add company name'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: [true, 'Please add job type']
  },
  location: {
    type: String,
    required: [true, 'Please add job location']
  },
  salary: {
    type: String,
    required: [true, 'Please add salary information']
  },
  duration: {
    type: String,
    required: [true, 'Please add job duration']
  },
  startDate: {
    type: Date
  },
  deadline: {
    type: Date
  },
  description: {
    type: String,
    required: [true, 'Please add job description']
  },
  responsibilities: {
    type: String,
    required: [true, 'Please add job responsibilities']
  },
  requirements: {
    type: String,
    required: [true, 'Please add job requirements']
  },
  benefits: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'filled'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
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

// Index for text search
JobSchema.index({ 
  title: 'text', 
  description: 'text',
  responsibilities: 'text',
  requirements: 'text',
  benefits: 'text'
});

// Reverse populate with virtuals
JobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId',
  justOne: false
});

JobSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'jobId',
  justOne: false
});

JobSchema.virtual('internReviews', {
  ref: 'InternReview',
  localField: '_id',
  foreignField: 'jobId',
  justOne: false
});

JobSchema.virtual('companyInterns', {
  ref: 'CompanyIntern',
  localField: '_id',
  foreignField: 'jobId',
  justOne: false
});

// Cascade delete related documents when a job is deleted
JobSchema.pre('remove', async function(next) {
  await this.model('Application').deleteMany({ jobId: this._id });
  await this.model('Interview').deleteMany({ jobId: this._id });
  await this.model('InternReview').deleteMany({ jobId: this._id });
  await this.model('CompanyIntern').deleteMany({ jobId: this._id });
  next();
});

// Update the updatedAt field before saving
JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', JobSchema);
