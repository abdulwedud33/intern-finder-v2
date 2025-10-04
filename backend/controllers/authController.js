const { User } = require('../models/User');
const Intern = require('../models/Intern');
const Company = require('../models/Company');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Register a new user (base function)
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role, ...profileData } = req.body;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // 2. Create user based on role
  let user;
  
  if (role === 'intern') {
    user = await Intern.create({
      name,
      email,
      password,
      phone,
      role,
      ...profileData
    });
  } else if (role === 'company') {
    user = await Company.create({
      name,
      email,
      password,
      phone,
      role,
      ...profileData
    });
  } else {
    return next(new ErrorResponse('Invalid role specified', 400));
  }

  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Register a new intern
 * @route   POST /api/auth/register/intern
 * @access  Public
 */
exports.registerIntern = (req, res, next) => {
  req.body.role = 'intern';
  registerUser(req, res, next);
};

/**
 * @desc    Register a new company
 * @route   POST /api/auth/register/company
 * @access  Public
 */
exports.registerCompany = (req, res, next) => {
  req.body.role = 'company';
  registerUser(req, res, next);
};

/**
 * @desc    Login user
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password, role, userType } = req.body;

  // 1. Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // 2. Find user by email
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // 3. Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // 4. Check role if specified (for backward compatibility with specific endpoints)
  if (role && user.role !== role) {
    return next(
      new ErrorResponse(`Not authorized to access this route as ${role}`, 403)
    );
  }

  // 5. For unified endpoint, include userType in response
  const responseData = {
    success: true,
    token: user.getSignedJwtToken(),
    userType: user.role, // Return the actual user role
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };

  res.status(200).json(responseData);
});


/**
 * @desc    Login user (unified endpoint for both intern and company)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = loginUser;

/**
 * @desc    Logout / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // Clear the token cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user data'
    });
  }
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    ...(req.user.role === 'intern' ? {
      // Intern-specific fields
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      // Add other intern fields as needed
    } : {
      // Company-specific fields
      industry: req.body.industry,
      description: req.body.description,
      // Add other company fields as needed
    })
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('No user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

  // TODO: Send email with reset token
  console.log('Reset URL:', resetUrl);

  res.status(200).json({ success: true, data: 'Email sent' });
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * Get token from model, create cookie and send response
 * @param   {Object} user - User document
 * @param   {number} statusCode - HTTP status code
 * @param   {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const cookieDaysRaw = process.env.JWT_COOKIE_EXPIRE;
  const cookieDays = cookieDaysRaw && !isNaN(Number(cookieDaysRaw)) ? Number(cookieDaysRaw) : 30;
  const options = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      role: user.role,
      id: user._id
    });
};
