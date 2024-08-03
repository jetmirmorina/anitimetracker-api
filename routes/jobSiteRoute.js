const express = require("express");
const {
  createJobSite,
  getAllJobSites,
  getSingleJobsite,
  deleteJobSite,
  updateJobSite,
} = require("../controllers/jobSiteController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
router.use(protect);
router.use(authorize("admin"));

router.route("/").post(createJobSite).get(getAllJobSites);
router
  .route("/:id")
  .get(getSingleJobsite)
  .put(updateJobSite)
  .delete(deleteJobSite);

module.exports = router;
