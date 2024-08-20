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

TimeSheetSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const status = update.status;

  if (status) {
    const docToUpdate = await this.model.findOne(this.getQuery());
    const user = await mongoose.model("User").findById(docToUpdate.user);

    switch (status) {
      case "clockin":
        user.activityStatus = "clockin";
        break;
      case "clockout":
        user.activityStatus = "offline";
        break;
      case "onBreak":
        user.activityStatus = "onBreak";
        break;

      default:
        console.log(`Unknown status: ${status}`);
    }

    await user.save();
  }

  next();
});

TimeSheetSchema.pre("findOneAndDelete", async function (next) {
  const timesheet = await this.model
    .findOne(this.getFilter())
    .populate("activity");

  if (timesheet && timesheet.activity.length > 0) {
    await TimesheetActivity.deleteMany({ _id: { $in: timesheet.activity } });
  }

  next();
});

module.exports = mongoose.model("TimeSheet", TimeSheetSchema);
