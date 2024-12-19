const mongoose = require("mongoose");
const defaultTransform = require("../utils/modelTransform");

const IndustrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true, transform: defaultTransform }
  }
);

module.exports = mongoose.model("Industry", IndustrySchema);
