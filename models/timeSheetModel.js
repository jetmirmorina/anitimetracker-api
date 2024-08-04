const mongoose = require("mongoose");

const TimeSheetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Please provide userId"],
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "Company",
  },
  activity: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "TimeSheetActivity",
    },
  ],
  endLocation: {
    latitude: Number,
    longitude: Number,
  },
  clockinTime: String,
  onBreakTime: String,
  fullDate: Date,
  date: String,
  staus: String,
  note: { type: String, maxlength: [250, "Note should be max 250 characters"] },
});

module.exports = mongoose.model("TimeSheet", TimeSheetSchema);
