const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    clockInRestrictions: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    industry: {
      type: mongoose.Schema.ObjectId,
      ref: "Industry",
      required: [true, "Please select industry"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CompanySchema.virtual("users", {
  ref: "User",
  localField: "_id",
  foreignField: "companies",
  justOne: false,
  options: { select: "name email role isEmailConfirmed" },
});

module.exports = mongoose.model("Company", CompanySchema);
