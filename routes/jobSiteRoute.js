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

router.route("/").post(authorize("admin"), createJobSite).get(getAllJobSites);
router
  .route("/:id")
  .get(getSingleJobsite)
  .put(authorize("admin"), updateJobSite)
  .delete(authorize("admin"), deleteJobSite);

module.exports = router;
