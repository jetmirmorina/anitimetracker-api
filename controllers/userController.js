const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/userModel");
const path = require("path");
const uploadFileToS3 = require("../utils/uploadFileToS3");
const { formatMongoData } = require("../utils/dbHelper");

// @desc    Get all Users
// @route   GET /api/v1/users
// @route   GET /apo/v1/company/:companyId/users
// @access  Private
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  if (req.params.companyId) {
    const users = await User.find({
      companies: req.params.companyId,
    });

    if (!users) {
      return next(
        new ErrorResponse(
          `The company with id: ${req.params.companyId} has no user registered`,
          400
        )
      );
    }
    res.status(200).json({ success: true, data: formatMongoData(users) });
  } else {
    res.status(200).json({ success: true, data: res.advancedResults });
  }
});

// @desc    Get User By Id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`No user found with id: ${rea.params.id}`, 400)
    );
  }

  res.status(200).json({ success: true, data: formatMongoData(user) });
});

// @dec     Delete user by id
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`No user found with id: ${req.params.id}`, 400)
    );
  }

  if (user.id !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id: ${req.params.id} is not authorized to delete this user`,
        401
      )
    );
  }

  user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ sucess: true, data: formatMongoData(user) });
});

// @desc    Update User Role
// @route   PUT /ap1/v1/user/:id/role
// @access  Privare
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  console.log(`role: ${req.body.role}`.bgRed);
  if (!user) {
    return next(
      new ErrorResponse(`No user found with id: ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id: ${req.user.id} is not authorize to update this user`,
        401
      )
    );
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: formatMongoData(user) });
});

// @desc    Update User Full Name
// @route   PUT /ap1/v1/user/:id/name
// @access  Privare
exports.updateUserFullName = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  console.log(`name: ${req.body.name}`.bgRed);
  if (!user) {
    return next(
      new ErrorResponse(`No user found with id: ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id: ${req.user.id} is not authorize to update this user`,
        401
      )
    );
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: formatMongoData(user) });
});

// @desc    Upload photo for user
// @route   PUT /api/v1/user/:id/photo
// @access  Private
exports.userPhotoUpload = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }
  if (req.params.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User with id: ${req.params.id} is not authorize to upload photo.`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image les then ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${user._id}${path.parse(file.name).ext}`;
  console.log(`file.name: ${file.name}`);
  console.log("S3_BUCKET_NAME:", process.env.S3_BUCKET_NAME);

  const uploadResult = await uploadFileToS3(file);
  user = await User.findByIdAndUpdate(
    req.params.id,
    { photo: uploadResult.Location },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: uploadResult.Location,
  });
});
