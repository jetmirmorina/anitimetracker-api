const express = require("express");
const {
  activity,
  getActivities,
  getActivitieByDate,
  clockin,
  clockout,
  addNote,
  startBreak,
  endBreak,
  getActivity,
  getUserTmesheets,
} = require("../controllers/timeSheetController");
const TimeSheet = require("../models/timeSheetModel");
const TimesheetActivity = require("../models/timeSheetActivityModel");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });
router.use(protect);

router.route("/").post(activity).get(advancedResults(TimeSheet), getActivities);
router.route("/:id").get(protect, getActivity);
router.route("/date/:date").get(protect, getActivitieByDate);
router.route("/clockin").post(protect, clockin);
router.route("/clockout/:timesheetId").post(protect, clockout);
router.route("/:id/note").post(protect, addNote);
router.route("/startbreak/:timesheetId").post(protect, startBreak);
router.route("/endbreak/:timesheetId").post(protect, endBreak);
router.route("/date/:date/user/:userid").get(protect, getUserTmesheets);

module.exports = router;
