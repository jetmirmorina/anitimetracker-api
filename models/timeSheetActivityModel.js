const mongoose = require("mongoose");

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
