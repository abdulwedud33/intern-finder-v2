const mongoose = require('mongoose');

const CompanyInternSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  intern: {
    type: mongoose.Schema.ObjectId,
    ref: 'Intern',
    required: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'terminated'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate entries
CompanyInternSchema.index({ company: 1, job: 1, intern: 1 }, { unique: true });

module.exports = mongoose.model('CompanyIntern', CompanyInternSchema);
