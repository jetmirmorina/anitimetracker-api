const mongoose = require("mongoose");

const TimeSheetActivitySchema = new mongoose.mongoose.Schema({
  location: {
    latitude: Number,
    longitude: Number,
  },
  address: String,
  fullDate: Date,
  date: String,

  type: {
    //clockin, clockout, break, job
    type: String,
    required: [true, "Please add a type"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  timesheet: {
    type: mongoose.Schema.ObjectId,
    ref: "TimeSheet",
  },
});

module.exports = mongoose.model("TimeSheetActivity", TimeSheetActivitySchema);
