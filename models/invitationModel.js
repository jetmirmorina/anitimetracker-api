const mongoose = require("mongoose");
const defaultTransform = require("../utils/modelTransform");

const InvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // The token will automatically be deleted after 1 hour
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true, transform: defaultTransform }
  }
);

module.exports = mongoose.model("Invitation", InvitationSchema);
