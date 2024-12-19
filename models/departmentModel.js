const mongoose = require("mongoose");
const defaultTransform = require("../utils/modelTransform");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },

    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    company: {
      type: mongoose.Schema.ObjectId,
      ref: "Company",
      required: [true, "Please provide companyId"],
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

module.exports = mongoose.model("Department", DepartmentSchema);
