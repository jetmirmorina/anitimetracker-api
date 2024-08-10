const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Department = require("../models/departmentModel");
const Company = require("../models/companyModel");
const { formatMongoData } = require("../utils/dbHelper");

// @desc    Create New Department
// @route   POST /api/v1/company/:companyId/department
// @access  Private
exports.createDepartment = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const companyId = req.params.companyId;

  const company = await Company.findById(companyId);

  if (!company) {
    return next(
      new ErrorResponse(`No company found with id: ${companyId}`, 404)
    );
  }

  const department = await Department.create({
    name,
    company: companyId,
    user: req.user.id,
  });

  res.status(201).json({ success: true, data: formatMongoData(department) });
});

// @desc    Get all Departments
// @route   GET /api/v1/departments
// @route   GET /api/v1/companies/:companyId/department
// @access  Private
exports.getDepartments = asyncHandler(async (req, res, next) => {
  if (req.params.companyId) {
    const departments = await Department.find({
      company: req.params.companyId,
    });
    res.status(200).json({ success: true, data: formatMongoData(departments) });
  } else {
    const departments = await Department.find();
    res.status(200).json({ success: true, data: formatMongoData(departments) });
  }
});

// @desc    Get all Departments
// @route   GET /api/v1/department/:id
// @access  Private
exports.getDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return next(
      new ErrorResponse(`No department found with id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: formatMongoData(departments) });
});

// @desc    Delete Department
// @route   DELETE /api/v1/department/:id
// @access  Private
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  let department = await Department.findById(req.params.id);
  if (!department) {
    return next(
      new ErrorResponse(`No department found with id: ${req.params.id}`, 404)
    );
  }
  department = await Department.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: formatMongoData(department) });
});

// @desc    Update Department
// @route   PUT /api/v1/department/:id
// @access  Private
exports.updateDepartment = asyncHandler(async (req, res, next) => {
  let department = await Department.findById(req.params.id);
  if (!department) {
    return next(
      new ErrorResponse(`No department found with id: ${req.params.id}`, 404)
    );
  }
  department = await Department.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, data: formatMongoData(department) });
});

// @desc    Add Members in Department
// @route   POST /api/v1/department/:id/member
// @access  Private
exports.addUsers = asyncHandler(async (req, res, next) => {
  let department = await Department.findById(req.params.id);
  const { users } = req.body;
  console.log(`users: ${users}`.bgYellow);
  if (!department) {
    return next(
      new ErrorResponse(`No Department found with id: ${req.params.id}`, 404)
    );
  }

  if (!users) {
    return next(new ErrorResponse(`Please add at least one user`, 400));
  }

  if (!Array.isArray(users)) {
    return next(new ErrorResponse(`Users should be an array of user IDs`, 400));
  }

  // Merge new users with existing users
  const existingUsers = department.users.map((user) => user.toString());
  const allUsers = [...new Set([...existingUsers, ...users])];

  department = await Department.findByIdAndUpdate(
    req.params.id,
    { users: allUsers },
    { new: true, runValidators: true }
  ).populate("users");

  res.status(200).json({ success: true, data: formatMongoData(department) });
});

// @desc    Get Members Of Department
// @route   GET /api/v1/department/:id/member
// @access  Private
exports.getMembers = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id).populate("users");

  if (!department) {
    return next(
      new ErrorResponse(`No Department found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: formatMongoData(department) });
});

// @desc    Remove Member From Department
// @route   Delete /api/v1/department/:id/member/:userId
// @access  Private
exports.deleteMember = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  console.log(`user id: ${userId}`.bgCyan);
  const department = await Department.findById(req.params.id).populate("users");

  if (!department) {
    return next(
      new ErrorResponse(`No Department found with id: ${req.params.id}`, 404)
    );
  }

  department.users = department.users.filter(
    (user) => user._id.toString() !== userId
  );

  console.log(` department.users: ${department.users}`.bgCyan);
  await department.save();

  res.status(200).json({ success: true, data: formatMongoData(department) });
});
