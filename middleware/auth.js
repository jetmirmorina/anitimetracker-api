const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/userModel");
const Company = require("../models/companyModel");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    const authHeader = req.headers.authorization;
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Please authenticate to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("User no longer exists", 401));
    }

    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return next(new ErrorResponse("Password recently changed. Please log in again", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Invalid authentication token", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Add company authorization middleware
exports.authorizeCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.companyId);
  
  if (!company) {
    return next(new ErrorResponse(`Company not found with id ${req.params.companyId}`, 404));
  }

  // Allow admins to access any company
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user belongs to the company
  const userCompanies = req.user.companies || [];
  if (!userCompanies.includes(company._id)) {
    return next(
      new ErrorResponse(`Not authorized to access this company's resources`, 403)
    );
  }

  // Add company to request object for later use
  req.company = company;
  next();
});
