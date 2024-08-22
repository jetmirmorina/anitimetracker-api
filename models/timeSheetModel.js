const mongoose = require("mongoose");
const TimesheetActivity = require("./timeSheetActivityModel");

const TimeSheetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Please provide userId"],
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
    },
    status: { type: String, default: "" },

    activity: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "TimeSheetActivity",
      },
    ],
    startLocation: {
      latitude: Number,
      longitude: Number,
    },
    endLocation: {
      latitude: Number,
      longitude: Number,
    },
    accuracy: { type: String, default: "" },
    fullDate: Date,
    date: String,
    note: {
      type: String,
      maxlength: [250, "Note should be max 250 characters"],
      default: "",
    },
    startTime: { type: Date, default: "" },
    endTime: { type: Date, default: "" },
  },
  {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
      transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

TimeSheetSchema.pre("save", async function (next) {
  if (this.isModified("status")) {
    const user = await mongoose.model("User").findById(this.user);
    user.activityStatus = this.status;
    await user.save();
  }

  next();
});

TimeSheetSchema.statics.saveUserActivityInfo = async function (
  userId,
  status,
  location
) {
  const user = await mongoose.model("User").findById(userId);
  user.activityStatus = status;
  user.location = location;
  user.lastLocationUpdate = Date();
  await user.save();
};

TimeSheetSchema.virtual("timeEntry").get(function () {
  const now = new Date();
  const clockinDate = this.startTime;
  const clockoutDate = this.endTime || now; // Use current date if no clockout

  const timeDifference = clockoutDate - clockinDate; // Difference in milliseconds

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  let result = "";

  if (hours > 0) {
    result += `${hours}h`;
  }
  if (minutes > 0 || hours > 0) {
    result += ` ${minutes % 60}m`;
  } else {
    result = `${seconds}s`; // If less than a minute, show seconds
  }
  return result.trim();
});

module.exports = mongoose.model("TimeSheet", TimeSheetSchema);
