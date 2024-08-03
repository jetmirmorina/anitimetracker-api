const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const JobSite = require("../models/jobSiteModel");
const Company = require("../models/companyModel");

// @desc    Create a jobSite for company
// @route   POST /api/v1/jobsite
// @access  Private
exports.createJobSite = asyncHandler(async (req, res, next) => {
  const { name, address, companyId, latitude, longitude, radius } = req.body;

  const company = await Company.findById(companyId);
  console.log(`company ${company}`);

  if (!company) {
    return next(
      new ErrorResponse(`No company found with id: ${companyId}`),
      404
    );
  }

  const jobSite = await JobSite.create({
    name,
    company: companyId,
    address,
    location: { latitude, longitude },
    radius,
  });

  res.status(201).json({ success: true, data: jobSite });
});

// @desc    Get all job sites
// @route   GET /api/v1/jobsite
// @route   GET /api/v1/company/:companyId/jobsite
// @access  Private
exports.getAllJobSites = asyncHandler(async (req, res, next) => {
  if (req.params.companyId) {
    const jobSites = await JobSite.find({ company: req.params.companyId }).sort(
      "-createdAt"
    );

    if (jobSites.length == 0) {
      return next(
        new ErrorResponse(
          `Company with id: ${req.params.companyId} has no jobSite saved`,
          400
        )
      );
    }
    res.status(200).json({ success: true, data: jobSites });
  } else {
    const jobSites = await JobSite.find().sort("-createdAt");
    res.status(200).json({ success: true, data: jobSites });
  }
});

// @desc    Get Single Job site
// @route   GET /api/v1/jobsite/:id
// @acces   Private
exports.getSingleJobsite = asyncHandler(async (req, res, next) => {
  const jobsite = await JobSite.findById(req.params.id);

  if (!jobsite) {
    return next(
      new ErrorResponse(`No jobsite found with id: ${req.params.id}`)
    );
  }

  res.status(200).json({ success: true, data: jobsite });
});

// @desc    Delete Single Job site
// @route   Delete /api/v1/jobsite/:id
// @acces   Private
exports.deleteJobSite = asyncHandler(async (req, res, next) => {
  let jobsite = await JobSite.findById(req.params.id);

  if (!jobsite) {
    return next(
      new ErrorResponse(`No jobsite found with id: ${req.params.id}`)
    );
  }
  jobsite = await JobSite.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: jobsite });
});

// @desc    Update Single Job site
// @route   PUT /api/v1/jobsite/:id
// @acces   Private
exports.updateJobSite = asyncHandler(async (req, res, next) => {
  let jobsite = await JobSite.findById(req.params.id);

  if (!jobsite) {
    return next(new ErrorResponse(`No jobsite found with id: ${req.param.id}`));
  }
  jobsite = await JobSite.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: jobsite });
});
