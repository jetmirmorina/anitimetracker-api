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
  getUserActivities,
  getUserActivityByDate,
} = require("../controllers/timeSheetController");
const TimeSheet = require("../models/timeSheetModel");
const TimesheetActivity = require("../models/timeSheetActivityModel");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });
router.use(protect);

router.route("/").post(activity).get(advancedResults(TimeSheet), getActivities);
router.route("/:id").get(getActivity);
router.route("/date/:date").get(getActivitieByDate);
router.route("/clockin").post(clockin);
router.route("/clockout/:timesheetId").post(clockout);
router.route("/:id/note").post(addNote);
router.route("/startbreak/:timesheetId").post(startBreak);
router.route("/endbreak/:timesheetId").post(endBreak);
router.route("/date/:date/user/:userid").get(getUserTmesheets);
router.route("/users").patch(getUserActivities);
router.route("/user/:userid/date/:date").get(getUserActivityByDate);

module.exports = router;
