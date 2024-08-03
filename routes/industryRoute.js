const express = require("express");
const {
  registerIndustry,
  getIndustries,
  getIndustry,
  deleteIndustry,
  updateIndustry,
} = require("../controllers/industryController");
const advancedResults = require("../middleware/advancedResults");
const Industry = require("../models/industryModel");

const router = express.Router();

router
  .route("/")
  .post(registerIndustry)
  .get(advancedResults(Industry), getIndustries);

router
  .route("/:id")
  .get(getIndustry)
  .delete(deleteIndustry)
  .put(updateIndustry);

module.exports = router;
