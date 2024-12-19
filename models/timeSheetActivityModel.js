const mongoose = require("mongoose");
const defaultTransform = require("../utils/modelTransform");

const TimeSheetActivitySchema = new mongoose.mongoose.Schema(
  {
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
    jobName: {
      type: String,
      default: "",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true, transform: defaultTransform }
  }
);

TimeSheetActivitySchema.pre("findByIdAndDelete", async function (next) {
  if (this.isModified("status")) {
    const user = await mongoose.model("User").findById(this.user);
    user.activityStatus = this.status;
    await user.save();
  }

  next();
});

module.exports = mongoose.model("TimeSheetActivity", TimeSheetActivitySchema);
