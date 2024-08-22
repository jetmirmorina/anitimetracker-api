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
    clockinTime: { type: String, default: "" },
    onBreakTime: { type: String, default: "" },
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

module.exports = mongoose.model("TimeSheet", TimeSheetSchema);
