const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Company = require("../models/companyModel");
const CompanyJob = require("../models/copanyJobModel");

// @desc    Create a Job for specific Company
// @route   POST /api/v1/company/:companyId/job
// @access  Private
exports.createJob = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;

  const company = await Company.findById(companyId);

  if (!company) {
    return next(
      new ErrorResponse(`No company found with id: ${companyId}`, 404)
    );
  }
  req.body.user = req.user.id;
  req.body.company = companyId;

  const companyJob = await CompanyJob.create(req.body);
  res.status(201).json({ success: true, data: companyJob });
});

// @desc    Get all companies
// @route   GET /api/v1/job
// @route   GET /api/v1/company/:companyId/job
// @access  Private
exports.getJobs = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;

  if (companyId) {
    const jobs = await CompanyJob.find({ company: companyId });
    res.status(200).json({ success: true, data: jobs });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Delete company
// @route   DELETE /api/v1/job/:id
// @access  Private
exports.deleteJob = asyncHandler(async (req, res, next) => {
  let job = await CompanyJob.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`No job found with id: ${req.params.id}`));
  }

  job = await CompanyJob.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: job });
});

// @desc    Get job by id
// @route   GET /api/v1/job/:id
// @access  Private
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await CompanyJob.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`No job found with id: ${req.params.id}`));
  }

  job = await CompanyJob.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, data: job });
});

// @desc    Update job by id
// @route   PUT /api/v1/job/:id
// @access  Private
exports.getJob = asyncHandler(async (req, res, next) => {
  let job = await CompanyJob.findById(req.params.id);

  if (!job) {
    return next(new ErrorResponse(`No job found with id: ${req.params.id}`));
  }

  job = await CompanyJob.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: job });
});
