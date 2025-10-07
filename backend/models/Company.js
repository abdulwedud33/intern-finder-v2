const mongoose = require('mongoose');
const { User } = require('./User');

// Define the Company schema
const companySchema = new mongoose.Schema({
  // Company Information
  industry: {
    type: String,
    required: [true, 'Please add an industry']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  
  // Company Details
  companySize: {
    type: String,
    enum: [
      '1-10 employees',
      '11-50 employees',
      '51-200 employees',
      '201-500 employees',
      '501-1000 employees',
      '1001-5000 employees',
      '5001-10,000 employees',
      '10,001+ employees'
    ]
  },
  foundedYear: {
    type: Number,
    min: [1800, 'Year must be after 1800']
  },
  companyType: {
    type: String,
    enum: ['startup', 'enterprise', 'agency', 'non-profit', 'educational', 'government', 'other']
  },
  
  // Location
  headquarters: String,
  
  // Contact Information
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  contactPhone: String,
  
  // Social Media
  socialMedia: {
    website: String,
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    github: String
  },
  
  // Additional Information
  benefits: [String],
  
  // Media
  logo: String,
  
  // Verification & Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Ratings & Reviews
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // System Fields
  lastActive: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for jobs
companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'companyId',
  justOne: false
});

// Virtual for applications
companySchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'companyId',
  justOne: false
});

// Virtual for interviews
companySchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'companyId',
  justOne: false
});

// Virtual for companyInterns
companySchema.virtual('companyInterns', {
  ref: 'CompanyIntern',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

// Virtual for reviews about this company
companySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'target',
  justOne: false,
  match: { targetModel: 'Company' }
});

// Virtual for reviews given by this company
companySchema.virtual('givenReviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'reviewer',
  justOne: false,
  match: { direction: 'company_to_intern' }
});

// Calculate profile completion percentage
companySchema.methods.calculateProfileCompletion = function() {
  let completion = 0;
  const fields = [
    this.name ? 1 : 0,
    this.email ? 1 : 0,
    this.phone ? 1 : 0,
    this.description ? 1 : 0,
    this.industry ? 1 : 0,
    this.headquarters?.address ? 1 : 0,
    this.logo ? 1 : 0,
    this.website ? 1 : 0
  ];
  
  completion = (fields.reduce((a, b) => a + b, 0) / fields.length) * 100;
  this.profileCompletion = Math.round(completion);
  return this.save();
};

// Create the Company model as a discriminator of User
// Ensure User model is registered first
if (!mongoose.models.User) {
  console.error('User model not registered when creating Company model');
}
const Company = User.discriminator('company', companySchema);

module.exports = Company;
