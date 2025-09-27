const mongoose = require('mongoose');

const CompanyReviewSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  intern: {
    type: mongoose.Schema.ObjectId,
    ref: 'Intern',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate reviews
CompanyReviewSchema.index({ company: 1, intern: 1 }, { unique: true });

module.exports = mongoose.model('CompanyReview', CompanyReviewSchema);
