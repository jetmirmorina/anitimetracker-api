const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Industry = require("../models/industryModel");

// @desc    Create Industry
// @route   POST /api/v1/industry
// @access  Public
exports.registerIndustry = asyncHandler(async (req, res, next) => {
  const industry = await Industry.create(req.body);
  res.status(201).json({ sucess: true, data: industry });
});

// @desc    Get All Industries
// @route   GET /api/v1/industry
// @access  Public
exports.getIndustries = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get Industry by id
// @route   GET /api/v1/industry/:id
// @access  Public
exports.getIndustry = asyncHandler(async (req, res, next) => {
  const industry = await Industry.findById(req.params.id);

  if (!industry) {
    return next(
      new ErrorResponse(`No industry found with id: ${req.params.id}`)
    );
  }
  res.status(200).json({ sucess: true, data: industry });
});

// @desc    Delete Industry by id
// @route   Delete /api/v1/industry/:id
// @access  Public
exports.deleteIndustry = asyncHandler(async (req, res, next) => {
  let industry = await Industry.findById(req.params.id);

  if (!industry) {
    return next(
      new ErrorResponse(`No industry found with id: ${req.params.id}`)
    );
  }

  industry = await Industry.findByIdAndDelete(req.params.id);
  res.status(200).json({ sucess: true, data: industry });
});

// @desc    Update Industry
// @route   Update /api/v1/industry/:id
// @access  Public
exports.updateIndustry = asyncHandler(async (req, res, next) => {
  let industry = await Industry.findById(req.params.id);

  if (!industry) {
    return next(
      new ErrorResponse(`No industry found with id: ${req.params.id}`)
    );
  }

  industry = await Industry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ sucess: true, data: industry });
});
