const mongoose = require("mongoose");

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
    fullDate: Date,
    date: String,
    staus: String,
    note: {
      type: String,
      maxlength: [250, "Note should be max 250 characters"],
      default: "",
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

module.exports = mongoose.model("TimeSheet", TimeSheetSchema);
