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

//Static method to get avg of course tutions
TimeSheetActivitySchema.statics.saveStatus = async function (
  timeSheetId,
  type
) {
  try {
    const ti = await this.model("TimeSheet").findByIdAndUpdate(timeSheetId, {
      staus: type,
    });
    console.log(`dffff: ${timeSheetId}`.bgRed);
  } catch (err) {
    console.error(err);
  }
};

// Call getAvarageCost after save
TimeSheetActivitySchema.post("findByIdAndUpdate", function () {
  console.log(`this.timesheet: ${this.timesheet}`.bgRed);
  console.log(`this.type: ${this.type}`.bgRed);

  //this.constructor.saveStatus(this.timesheet, this.type);
});

module.exports = mongoose.model("TimeSheetActivity", TimeSheetActivitySchema);
