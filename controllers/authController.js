const mongoose = require("mongoose");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const { formatMongoData } = require("../utils/dbHelper");

// @desc    Register user
// @route   POST /ap1/v1/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    companyName,
    industry,
    address,
    description,
  } = req.body;

  if (!companyName || !industry) {
    return next(
      new ErrorResponse("Please fill all required fields for company", 400)
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  // Create user
  let user = await User.create([{ name, email, password, role }], {
    session,
  });

  // Generate email confirmation token
  const confirmEmailToken = user[0].generateEmailConfirmToken();

  // Save user without running validation again
  await user[0].save({ validateBeforeSave: false, session });

  // Create company
  const company = await Company.create(
    [
      {
        name: companyName,
        industry,
        address,
        description,
      },
    ],
    { session }
  );

  const createdCompany = company[0];

  // Update user with company ID
  user = await User.findByIdAndUpdate(
    user[0]._id,
    { companies: [createdCompany._id] },
    { new: true, runValidators: true, session }
  );
  await session.commitTransaction();
  session.endSession();

  // Create confirmation URL
  const confirmEmailURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;
  const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

  // Send email confirmation
  // await sendEmail({
  //   email: user.email,
  //   subject: "Email confirmation token",
  //   message,
  // });

  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /ap1/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`), 404);
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // Check if password metch
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
  });
});

// @desc    Get current logged in user
// @route   GET /ap1/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "companies",
    select: "name address description photo clockInRestrictions",
  });
  res.status(200).json({ success: true, data: user });
});

// @desc    Check if email is already registered
// @route   POST /ap1/v1/auth/checkemail
// @access  Public
exports.checkEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(200).json({ success: true, data: { emailExist: true } });
  }
  res.status(200).json({ success: true, data: { emailExist: false } });
});

// @desc    Forgot password
// @route   POST /ap1/v1/auth/forgotpassword
// @access  Private
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  console.log(`Reset token: ${resetToken}`.bold.yellow);
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) 
  has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }

  // res.status(200).json({ success: true, data: user });
});

// @desc    Reset Password
// @route   PUT /ap1/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update user details
// @route   PUT /ap1/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update Password
// @route   PUT /ap1/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("+activityStatus")
    .select("+activityLocation");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Confirm Email
// @route   GET /api/v1/auth/confirmemail
// @access  Public
exports.confirmEmail = asyncHandler(async (req, res, next) => {
  // grab token from email
  const { token } = req.query;

  if (!token) {
    return next(new ErrorResponse("Invalid Token", 400));
  }

  const splitToken = token.split(".")[0];
  const confirmEmailToken = crypto
    .createHash("sha256")
    .update(splitToken)
    .digest("hex");

  // get user by token
  const user = await User.findOne({
    confirmEmailToken,
    isEmailConfirmed: false,
  });

  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }

  // update confirmed to true
  user.confirmEmailToken = undefined;
  user.isEmailConfirmed = true;

  // save
  user.save({ validateBeforeSave: false });

  // return token
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, data: formatMongoData(user), token });
};

// Function to add a user to a company and vice versa
const addUserToCompany = asyncHandler(async (userId, companyId, res) => {
  // Add company to user's companies array
  const user = await User.findByIdAndUpdate(
    userId,
    { company: companyId },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse("User or Company not found", 400));
  }

  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(201)
    .cookie("token", token, options)
    .json({ success: true, data: { user, company }, token });
});
