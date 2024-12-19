const mongoose = require("mongoose");
const defaultTransform = require("../utils/modelTransform");

const JobSiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add address"],
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    radius: Number,
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true, transform: defaultTransform }
  }
);

module.exports = mongoose.model("JobSite", JobSiteSchema);
