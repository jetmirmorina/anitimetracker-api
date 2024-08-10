const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Invitation = require("../models/invitationModel");
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const sendEmail = require("../utils/sendEmail");
const { formatMongoData } = require("../utils/dbHelper");

// @desc    Invite User
// @route   POST /company/:companyId/invite
// @access  Private
exports.inviteUser = asyncHandler(async (req, res, next) => {
  const { emails } = req.body;
  const companyId = req.params.companyId;

  if (!Array.isArray(emails) || emails.length === 0) {
    return next(new ErrorResponse("Please provide at least one email", 400));
  }

  const invitations = emails.map((email) => {
    const inviteToken = crypto.randomBytes(20).toString("hex");
    return {
      email,
      token: inviteToken,
      company: companyId,
    };
  });

  // Save all invitations to the database
  await Invitation.insertMany(invitations);

  // Send invitations (this can be a separate function or service)
  invitations.forEach(async (invitation) => {
    const inviteURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/invite/${invitation.token}`;
    // Use your email service to send the email
    // const sendResult = await sendEmail({
    //   email: invitation.email,
    //   subject: "Company Invitation",
    //   message,
    // });

    console.log(`User Invitation lin -> ${inviteURL}`.bgYellow);
  });

  res.status(200).json({
    success: true,
    data: formatMongoData(invitations),
  });
});

// // Generate a token
// const inviteToken = crypto.randomBytes(20).toString("hex");
// // Save the token and the company ID to the database (e.g., in an invitations collection)
// const invitation = await Invitation.create({
//   email,
//   token: inviteToken,
//   company: companyId,
// });

// // Create invitation URL
// const inviteUrl = `${req.protocol}://${req.get(
//   "host"
// )}/api/auth/accept-invite/${inviteToken}`;

// const message = `You have been invited to join the company. Please use the following link to accept the invitation and complete your registration: \n\n ${inviteUrl}`;

// // Create reset url
// const confirmEmailURL = `${req.protocol}://${req.get(
//   "host"
// )}/api/v1/auth/confirmemail?token=${inviteToken}`;

// invitation.save({ validateBeforeSave: false });

// // const sendResult = await sendEmail({
// //   email: email,
// //   subject: "Company Invitation",
// //   message,
// // });
// console.log(`Invite user: ${confirmEmailURL}`);

//   res.status(201).json({ success: true, data: "Invitation sent" });
// });

// @desc    Accept Invitation
// @route   POST /accept-invite/:token
// @access  Private
exports.acceptInvite = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { name, email, password } = req.body;

  let invitation = await Invitation.findOne({ token });
  const company = await Company.findById(invitation.company);

  if (!invitation) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  if (!company) {
    return next(
      new ErrorResponse(`No company exist with id: ${invitation.company}`, 400)
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "employee",
    isEmailConfirmed: true,
    companies: [invitation.company],
  });

  await invitation.deleteOne();
  res.send(201).json({ success: true, data: formatMongoData(user) });
});

// @desc    Get Invitation for specific Company
// @route   GET /invites
// @route   GET /company/:companyId/invites
// @access  Private
exports.getInvites = asyncHandler(async (req, res, next) => {
  if (req.params.companyId) {
    if (req.user.role !== "admin") {
      res.status(200).json({ success: true, data: [] });
    }
    const companies = await Invitation.find({ company: req.params.companyId });
    res.status(200).json({ success: true, data: formatMongoData(companies) });
  } else {
    res.status(200).json({ success: true, data: res.advancedResults });
  }
});

// @desc    Get Invitation by id
// @route   GET /invites/:id
// @access  Private
exports.getInvite = asyncHandler(async (req, res, next) => {
  const companies = await Invitation.findById(req.params.id).populate({
    path: "company",
    select: "name description address",
  });
  if (!companies) {
    return next(
      new ErrorResponse(`No company found with id: ${req.params.id}`)
    );
  }
  res.status(200).json({ success: true, data: formatMongoData(companies) });
});

// @desc    Delete Invitation by id
// @route   DELETE /invites/:id
// @access  Private
exports.deleteInvite = asyncHandler(async (req, res, next) => {
  let companies = await Invitation.findById(req.params.id);
  if (!companies) {
    return next(
      new ErrorResponse(`No company found with id: ${req.params.id}`)
    );
  }
  companies = await Invitation.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: formatMongoData(companies) });
});
