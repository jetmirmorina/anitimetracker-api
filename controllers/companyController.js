const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Company = require("../models/companyModel");
const User = require("../models/userModel");
const path = require("path");

// @desc    Create New Company
// @route   POST /api/v1/company
// @access  Private
exports.createCompany = asyncHandler(async (req, res, next) => {
  // req.body.user = req.user.id;
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You are not authirized to create an company`, 401)
    );
  }
  const company = await Company.create(req.body);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $push: { companies: company._id } },
    { new: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: company });
});

// @desc    Get All Companies
// @route   GET /api/v1/companies
// @access  Private
exports.getCompanies = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: res.advancedResults });
});

// @desc    Get Company By Id
// @route   POST /api/v1/company/:id
// @access  Private
exports.getCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id)
    .populate({
      path: "users",
      select: "name email role isEmailConfirmed",
    })
    .populate({
      path: "industry",
      select: "name",
    });

  if (!company) {
    return next(
      new ErrorResponse(`No company found with id: ${req.params.id}`)
    );
  }

  res.status(200).json({ success: true, data: company });
});

// @desc    Update Clock In Restriction
// @route   PUT /ap1/v1/company/:id/clockinrestrictions
// @access  Privare
exports.updateClockInRestrictions = asyncHandler(async (req, res, next) => {
  console.log("called".bgRed);

  let company = await Company.findById(req.params.id);
  if (!company) {
    return next(
      new ErrorResponse(`No company found with id: ${req.params.id}`, 404)
    );
  }

  company = await Company.findByIdAndUpdate(
    req.params.id,
    { clockInRestrictions: req.body.clockInRestrictions },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: company });
});

// @desc    Update Company
// @route   PUT /ap1/v1/company/:id
// @access  Privare
exports.updateCompany = asyncHandler(async (req, res, next) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`No company found with id: ${req.params.id}`, 404)
    );
  }

  if (req.params.id !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id: ${req.params.id} is not authorize to update this course`,
        401
      )
    );
  }

  company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: company });
});

// @desc    Delete Company
// @route   DELETE /ap1/v1/company/:id
// @access  Private
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`No company found with id: ${req.params.id}`, 404)
    );
  }

  if (req.params.id !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id: ${req.params.id} is not authorize to delete this course`,
        401
      )
    );
  }

  company = await Company.findOneAndDelete(req.params.id);

  res.status(200).json({ success: true, data: company });
});

// @desc    Upload photo for company
// @route   PUT /api/v1/company/:id/photo
// @access  Private
exports.companyPhotoUpload = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`Company not found with id ${req.params.id}`, 404)
    );
  }
  if (company.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id: ${req.params.id} is not authorize to upload photo to this Company`,
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
  file.name = `photo_${company._id}${path.parse(file.name).ext}`;
  console.log(`file.name: ${file.name}`);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
    if (error) {
      console.log(error);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    const bootcamp = await Company.findByIdAndUpdate(
      req.params.id,
      { photo: file.name },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
