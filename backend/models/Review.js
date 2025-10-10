const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // The user who is giving the review
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // The target of the review (either Company or Intern)
  target: {
    type: mongoose.Schema.ObjectId,
    required: true,
    // Reference to User model (for both Company and Intern discriminators)
    ref: 'User'
  },
  // Dynamic reference to either Company or Intern
  targetModel: {
    type: String,
    required: true,
    enum: ['Company', 'Intern']
  },
  // Optional job reference if the review is job-specific
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job'
  },
  // Rating (1-5)
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  // Review content
  content: {
    type: String,
    required: [true, 'Please provide review content'],
    maxlength: [2000, 'Review cannot be more than 2000 characters']
  },
  // Additional feedback (optional)
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  // Whether the review is from a company to an intern or vice versa
  direction: {
    type: String,
    enum: ['company_to_intern', 'intern_to_company'],
    required: true
  },
  // Status of the review (pending, approved, rejected)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Admin/moderation notes
  adminNotes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate reviews from the same user to the same target
ReviewSchema.index(
  { reviewer: 1, target: 1, job: 1 },
  { unique: true, partialFilterExpression: { job: { $exists: true } } }
);

// Index for faster queries
ReviewSchema.index({ target: 1, targetModel: 1 });
ReviewSchema.index({ reviewer: 1 });
ReviewSchema.index({ status: 1 });

// Virtual for getting the target details
ReviewSchema.virtual('targetDetails', {
  ref: function() {
    return this.targetModel;
  },
  localField: 'target',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting the reviewer details
ReviewSchema.virtual('reviewerDetails', {
  ref: 'User',
  localField: 'reviewer',
  foreignField: '_id',
  justOne: true
});

// Static method to get average rating for a target
ReviewSchema.statics.getAverageRating = async function(targetId, targetModel) {
  const obj = await this.aggregate([
    {
      $match: {
        target: targetId,
        targetModel: targetModel,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$target',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model(targetModel).findByIdAndUpdate(targetId, {
      averageRating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      reviewCount: obj[0] ? obj[0].totalReviews : 0
    });
  } catch (err) {
    console.error(`Error updating ${targetModel} rating:`, err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.target, this.targetModel);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.target, this.targetModel);
});

module.exports = mongoose.model('Review', ReviewSchema);
