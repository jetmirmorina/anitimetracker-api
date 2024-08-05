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

TimeSheetActivitySchema.statics.saveUserStatus = async function (
  userId,
  status
) {
  try {
    await this.model("User").findByIdAndUpdate(
      { _id: userId },
      {
        activityStatus: status,
      }
    );
  } catch (err) {
    console.error(err);
  }
};

TimeSheetActivitySchema.post("save", function () {
  this.constructor.saveUserStatus(this.user.toString(), this.type);
});

module.exports = mongoose.model("TimeSheetActivity", TimeSheetActivitySchema);
