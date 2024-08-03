const express = require("express");
const {
  createJob,
  getJobs,
  getJob,
  deleteJob,
  updateJob,
} = require("../controllers/companyJobController");
const advancedResults = require("../middleware/advancedResults");
const { protect } = require("../middleware/auth");
const CompanyJob = require("../models/copanyJobModel");

const router = express.Router({ mergeParams: true });
router.use(protect);

router.route("/").post(createJob).get(advancedResults(CompanyJob), getJobs);

router.route("/:id").get(getJob).delete(deleteJob).put(updateJob);

module.exports = router;
