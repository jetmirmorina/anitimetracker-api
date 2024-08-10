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
  status,
  location,
  address
) {
  try {
    await this.model("User").findByIdAndUpdate(
      { _id: userId },
      {
        activityStatus: status,
        activityLocation: location,
        activityAdress: address,
      }
    );
  } catch (err) {
    console.error(err);
  }
};

TimeSheetActivitySchema.post(
  "save",
  function () {
    let activity = "";
    let address = this.address;
    let location = this.location;

    switch (this.type) {
      case "clockin":
        console.log("clockin");
        activity = "clockin";

        break;
      case "startBreak":
        console.log("onBreak");
        activity = "onBreak";
        break;
      case "endBreak":
        console.log("clockin");
        activity = "clockin";
        break;

      case "clockout":
        console.log(`clockout`.bold.bgGreen);
        activity = "offline";
        address = "";
        location = {};
        break;
      default:
        console.log("Unknown action");
        break;
    }
    this.constructor.saveUserStatus(
      this.user.toString(),
      activity,
      location,
      address
    );
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

module.exports = mongoose.model("TimeSheetActivity", TimeSheetActivitySchema);
