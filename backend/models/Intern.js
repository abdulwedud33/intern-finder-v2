const mongoose = require('mongoose');
const { User } = require('./User');

// Define the Intern schema
const internSchema = new mongoose.Schema({
  // Personal Information
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: [true, 'Please add gender']
  },
  
  
  // Skills
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: Number
  }],
  
  // Experience
  experience: [{
    title: {
      type: String,
      required: [true, 'Please add a job title']
    },
    company: {
      type: String,
      required: [true, 'Please add a company name']
    },
    location: {
      type: String
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: false
    },
    description: String,
    skills: [String]
  }],
  
  // Documents
  resume: String,
  coverLetter: String,
  portfolioUrl: String,
  githubUrl: String,
  linkedinUrl: String,
  
  // Preferences
  jobPreferences: {
    jobTypes: [String],
    locations: [String],
    remote: {
      type: Boolean,
      default: false
    },
    remoteOnly: {
      type: Boolean,
      default: false
    },
    salaryExpectations: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      }
    },
    industries: [String],
    companySizes: [String],
    workAuthorizations: [String],
    relocation: {
      type: Boolean,
      default: false
    }
  },
  
  // Registration details aligned with frontend
  workAuthorization: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    trim: true
  },
  preferredIndustries: [String],
  relocation: {
    type: Boolean,
    default: false
  },
  
  // Application Status
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // Additional Info
  languages: [{
    name: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'native'],
      required: true
    }
  }],
  
  // System Fields
  lastActive: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for applications
internSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'internId',
  justOne: false
});

// Virtual for interviews
internSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'internId',
  justOne: false
});

// Virtual for companyInterns
internSchema.virtual('companyInterns', {
  ref: 'CompanyIntern',
  localField: '_id',
  foreignField: 'intern',
  justOne: false
});

// Reviews about this intern (from companies)
internSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'target',
  justOne: false,
  match: { targetModel: 'Intern' }
});

// Reviews given by this intern (about companies)
internSchema.virtual('givenReviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'reviewer',
  justOne: false,
  match: { direction: 'intern_to_company' }
});

// Calculate profile completion percentage
internSchema.methods.calculateProfileCompletion = function() {
  let completion = 0;
  const fields = [
    this.name ? 1 : 0,
    this.email ? 1 : 0,
    this.phone ? 1 : 0,
    this.about ? 1 : 0,
    this.skills?.length > 0 ? 1 : 0,
    this.experience?.length > 0 ? 1 : 0,
    this.resume ? 1 : 0,
    this.avatar ? 1 : 0
  ];
  
  completion = (fields.reduce((a, b) => a + b, 0) / fields.length) * 100;
  this.profileCompletion = Math.round(completion);
  return this.save();
};

// Create the Intern model as a discriminator of User
const Intern = User.discriminator('intern', internSchema);

module.exports = Intern;
