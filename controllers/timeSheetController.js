const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const TimeSheet = require("../models/timeSheetModel");
const TimesheetActivity = require("../models/timeSheetActivityModel");
const Company = require("../models/companyModel");
const JobSite = require("../models/jobSiteModel");
const haversineDistance = require("../utils/distance");
const User = require("../models/userModel");
const { formatMongoData } = require("../utils/dbHelper");

const {
  calculateUserClockinDuration,
  calculateAdminlockinDuration,
  calculateBreakDuration,
} = require("../utils/calculateDuration");

// @desc    Clock In
// @route   POST /api/v1/company/:companyId/activity/clockin
// @access  Private
exports.clockin = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;
  const { latitude, longitude, address, fullDate, date } = req.body;

  if (!companyId) {
    return next(
      new ErrorResponse(`Company with id: ${companyId} does not exist`, 404)
    );
  }

  const company = await Company.findById(companyId);

  let insideRadius = false;

  if (company.clockInRestrictions) {
    const jobsites = await JobSite.find({ company: companyId });

    for (const jobSite of jobsites) {
      const distance = haversineDistance(
        { lat: jobSite.location.latitude, lng: jobSite.location.longitude },
        { lat: latitude, lng: longitude }
      );

      if (distance <= jobSite.radius) {
        insideRadius = true;
        break;
      }
    }
  }

  if (company.clockInRestrictions && !insideRadius) {
    res
      .status(400)
      .json({ success: false, error: "You are not near yout job location" });
  }

  let activity = new TimesheetActivity({
    location: { latitude, longitude },
    address,
    fullDate,
    date,
    type: "clockin",
    user: req.user.id,
  });
  await activity.save();

  let timesheet = new TimeSheet({
    user: req.user.id,
    date,
    activity: [activity._id],
    company: companyId,
    fullDate: fullDate,
    staus: "clockin",
    startLocation: { latitude, longitude },
    startTime: fullDate,
  });

  await timesheet.save();
  activity = await TimesheetActivity.findByIdAndUpdate(
    activity.id,
    { timesheet: timesheet.id, status: "clockin" },
    { new: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: timesheet });
});

// @desc    Clock Out
// @route   POST /api/v1/company/:companyId/activity/clockout/:timesheetId
// @access  Private
exports.clockout = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;
  const timesheetId = req.params.timesheetId;

  if (!companyId) {
    return next(new ErrorResponse(`Please provide companyId`, 400));
  }

  if (!timesheetId) {
    return next(new ErrorResponse(`Please provide timesheetId`, 400));
  }

  const { latitude, longitude, address, fullDate, date } = req.body;

  let activity = new TimesheetActivity({
    location: { latitude, longitude },
    address,
    fullDate,
    date,
    type: "clockout",
    user: req.user.id,
    timesheet: timesheetId,
  });

  let timeSheet = await TimeSheet.findById(timesheetId);
  if (!timeSheet) {
    return next(
      new ErrorResponse(`Timesheet with id: ${companyId} does not exist`, 404)
    );
  }

  timeSheet.activity.push(activity._id);

  await activity.save();
  await timeSheet.save();

  let totalDuration = "";

  const totalTime = await calculateUserClockinDuration(
    timesheetId,
    date,
    req.user.id
  );

  await User.findByIdAndUpdate(req.user.id, {
    activityLocation: undefined,
    activityAdress: undefined,
  });

  // Update the TimeSheet document
  const updatedTimeSheet = await TimeSheet.findByIdAndUpdate(
    timesheetId,
    {
      clockinTime: totalTime,
      status: "clockout",
      endLocation: { undefined, undefined },
      endTime: fullDate,
    },
    { new: true } // This option returns the updated document
  );

  res
    .status(201)
    .json({ success: true, data: formatMongoData(updatedTimeSheet) });
});

// @desc    Start Break
// @route   POST /api/v1/company/:companyId/activity/startbreak/:timesheetId
// @access  Private
exports.startBreak = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;
  const timesheetId = req.params.timesheetId;

  if (!companyId) {
    return next(new ErrorResponse(`Please provide companyId`, 400));
  }

  if (!timesheetId) {
    return next(new ErrorResponse(`Please provide timesheetId`, 400));
  }

  const { latitude, longitude, address, fullDate, date } = req.body;

  let activity = new TimesheetActivity({
    location: { latitude, longitude },
    address,
    fullDate,
    date,
    type: "startBreak",
    user: req.user.id,
    timesheet: timesheetId,
  });

  let timeSheet = await TimeSheet.findById(timesheetId);
  if (!timeSheet) {
    return next(
      new ErrorResponse(`Timesheet with id: ${companyId} does not exist`, 404)
    );
  }

  timeSheet.activity.push(activity._id);

  await activity.save();
  await timeSheet.save();

  timeSheet = await TimeSheet.findByIdAndUpdate(
    timesheetId,
    { status: "onBreak", endLocation: { latitude, longitude } },
    { new: true } // This option returns the updated document
  );

  res.status(201).json({ success: true, data: formatMongoData(timeSheet) });
});

// @desc    End Break
// @route   POST /api/v1/company/:companyId/activity/endbreak/:timesheetId
// @access  Private
exports.endBreak = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;
  const timesheetId = req.params.timesheetId;

  if (!companyId) {
    return next(new ErrorResponse(`Please provide companyId`, 400));
  }

  if (!timesheetId) {
    return next(new ErrorResponse(`Please provide timesheetId`, 400));
  }

  const { latitude, longitude, address, fullDate, date } = req.body;

  let activity = new TimesheetActivity({
    location: { latitude, longitude },
    address,
    fullDate,
    date,
    type: "endBreak",
    user: req.user.id,
    timesheet: timesheetId,
  });

  let timeSheet = await TimeSheet.findById(timesheetId);
  if (!timeSheet) {
    return next(
      new ErrorResponse(`Timesheet with id: ${companyId} does not exist`, 404)
    );
  }

  timeSheet.activity.push(activity._id);

  await activity.save();
  await timeSheet.save();

  let totalDuration = "";

  const totalTime = await calculateBreakDuration(
    timesheetId,
    date,
    req.user.id
  );

  // Update the TimeSheet document
  const updatedTimeSheet = await TimeSheet.findByIdAndUpdate(
    timesheetId,
    {
      onBreakTime: totalTime,
      status: "clockin",
      endLocation: { latitude, longitude },
    },
    { new: true } // This option returns the updated document
  );

  res
    .status(201)
    .json({ success: true, data: formatMongoData(updatedTimeSheet) });
});

// @desc    Start Break
// @route   POST /api/v1/company/:companyId/activity/startbreak/:timesheetId
// @access  Private
exports.startBreak = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;
  const timesheetId = req.params.timesheetId;

  if (!companyId) {
    return next(new ErrorResponse(`Please provide companyId`, 400));
  }

  if (!timesheetId) {
    return next(new ErrorResponse(`Please provide timesheetId`, 400));
  }

  const { latitude, longitude, address, fullDate, date } = req.body;

  let activity = new TimesheetActivity({
    location: { latitude, longitude },
    address,
    fullDate,
    date,
    type: "startBreak",
    user: req.user.id,
    timesheet: timesheetId,
  });

  let timeSheet = await TimeSheet.findById(timesheetId);
  if (!timeSheet) {
    return next(
      new ErrorResponse(`Timesheet with id: ${companyId} does not exist`, 404)
    );
  }

  timeSheet.activity.push(activity._id);

  await activity.save();
  await timeSheet.save();

  timeSheet = await TimeSheet.findByIdAndUpdate(
    timesheetId,
    { status: "onBreak", endLocation: { latitude, longitude } },
    { new: true } // This option returns the updated document
  );

  res.status(201).json({ success: true, data: formatMongoData(timeSheet) });
});

// @desc    Post Timesheet Note
// @route   POST  /ap1/v1/timesheet/:id/note
// @access  Private
exports.addNote = asyncHandler(async (req, res, next) => {
  let timesheet = await TimeSheet.findById(req.params.id);

  if (!timesheet) {
    return next(
      new ErrorResponse(`No timesheet found with id: ${req.params.id}`, 404)
    );
  }

  timesheet = await TimeSheet.findByIdAndUpdate(
    req.params.id,
    { note: req.body.note },
    { new: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: formatMongoData(timesheet) });
});

// @desc    Start activity
// @route   POST /api/v1/company/:companyId/activity
// @access  Private
exports.activity = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;

  if (!companyId) {
    return next(
      new ErrorResponse(`Company with id: ${companyId} does not exist`, 404)
    );
  }

  const { latitude, longitude, address, fullDate, date, type } = req.body;

  let activity = new TimesheetActivity({
    location: { latitude, longitude },
    address,
    fullDate,
    date,
    type,
    user: req.user.id,
  });
  await activity.save();

  let timesheet = await TimeSheet.findOne({ date, user: req.user.id });

  if (activity.type === "clockin") {
    if (!timesheet) {
      timesheet = new TimeSheet({
        user: req.user.id,
        date,
        activity: [activity._id],
        company: companyId,
      });
    } else {
      timesheet.activity.push(activity._id);
    }
  } else {
    timesheet.activity.push(activity._id);
  }

  activity = await TimesheetActivity.findByIdAndUpdate(
    activity.id,
    { timesheet: timesheet.id },
    { new: true, runValidators: true }
  );

  await timesheet.save();

  const difference = await calculateTimeDifferences(
    timesheet.id,
    date,
    req.user.id
  );

  console.log(`Difference: ${difference}`.bgGreen);

  await calculateTimeDifferences(timesheet.id, date, req.user.id).then(
    (result) => console.log(`Total Duration: ${result}`)
  );

  res.status(201).json({ success: true, data: formatMongoData(timesheet) });
});

// @desc    Get activities
// @route   POST /api/v1/company/:companyId/activity
// @access  Private
exports.getActivities = asyncHandler(async (req, res, next) => {
  console.log(`=======`.bgGreen);
  const companyId = req.params.companyId;
  if (req.user.role === "employee") {
    const timeSheet = await TimeSheet.find({
      company: companyId,
      user: req.user.id,
    }).populate({
      path: "activity",
      select: "type location address fullDate date",
    });
    res.status(200).json({ success: true, data: formatMongoData(timeSheet) });
  } else {
    const timeSheet = await TimeSheet.find({ company: companyId }).populate({
      path: "activity",
      select: "type location address fullDate date",
    });

    res.status(200).json({ success: true, data: formatMongoData(timeSheet) });
  }
});

// @desc    Get activities
// @route   POST /api/v1/company/:companyId/activity/date/:date
// @access  Private
exports.getActivitieByDate = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.role === "employee") {
    const timeSheet = await TimeSheet.find({
      company: companyId,
      date: req.params.date,
      user: req.user.id,
    }).populate({
      path: "activity",
    });

    res.status(200).json({ success: true, data: timeSheet });
  } else {
    const timeSheet = await TimeSheet.find({
      company: companyId,
      date: req.params.date,
    })
      .select("onBreakTime clockinTime endLocation fullDate date staus")

      .populate({ path: "user", select: "name photo" });

    res.status(200).json({ success: true, data: formatMongoData(timeSheet) });
  }
});

// @desc    Get activities per user
// @route   GET /api/v1/company/:companyId/activity/date/:date/user/:userid
// @access  Private
exports.getUserTmesheets = asyncHandler(async (req, res, next) => {
  const companyId = req.params.companyId;

  if (!companyId) {
    return next(
      new ErrorResponse(`Company with id: ${companyId} does not exist`, 404)
    );
  }
  const timeShees = await TimeSheet.find({
    user: req.params.userid,
    date: req.params.date,
  }).populate({
    path: "activity",
    select: "type address fullDate date endBreak location",
  });

  res.status(200).json({ success: true, data: formatMongoData(timeShees) });
});

// @desc    Get Timesheet By Id
// @route   GET /api/v1/activity/:id
// @access  Private
exports.getActivity = asyncHandler(async (req, res, next) => {
  const timesheet = await TimeSheet.findById(req.params.id)
    .populate({
      path: "activity",
    })
    .populate({ path: "user" })
    .populate({ path: "company" });

  if (!timesheet) {
    return next(
      new ErrorResponse(`No timesheet found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, json: formatMongoData(timesheet) });
});

// @desc    Update Clock In Restriction
// @route   GET /ap1/v1/company/:companyId/activity/users
// @access  Privare
exports.getUserActivities = asyncHandler(async (req, res, next) => {
  let company = await Company.findById(req.params.companyId);
  if (!company) {
    return next(
      new ErrorResponse(
        `No company found with id: ${req.params.companyId}`,
        404
      )
    );
  }

  const users = await User.find({ companies: req.params.companyId }).select(
    "+activityStatus +activityAdress +activityLocation.latitude +activityLocation.longitude -companies"
  );
  const sortedUsers = users.sort((a, b) => {
    const order = ["clockin", "onbreak", "offline"];
    return order.indexOf(a.activityStatus) - order.indexOf(b.activityStatus);
  });
  res.status(200).json({ success: true, data: formatMongoData(sortedUsers) });
});
