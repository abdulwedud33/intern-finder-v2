const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Base User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['intern', 'company'],
      required: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number']
    },
    avatar: {
      type: String,
      default: ''
    },
    about: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    social: {
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      github: { type: String, default: '' }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  const expiresIn = process.env.JWT_EXPIRE && process.env.JWT_EXPIRE.trim() !== ''
    ? process.env.JWT_EXPIRE
    : '30d';
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn
  });
};

// Match user entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Base User model - only register if not already registered
let User;
if (mongoose.models.User) {
  User = mongoose.models.User;
} else {
  User = mongoose.model('User', userSchema);
}

// Export the base model and schema for extending
module.exports = { User, userSchema };
