const express = require("express");
const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  companyPhotoUpload,
  updateClockInRestrictions,
} = require("../controllers/companyController");
const advancedResults = require("../middleware/advancedResults");
const Company = require("../models/companyModel");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Include other resources routers
const inviteRouter = require("./inviteRoute");
const usersRouter = require("./userRoute");
const jobsiteRouter = require("./jobSiteRoute");
const departmentRouter = require("./departmentRoute");
const timesheetRouter = require("./timeSheetRoute");
const companyJobRoute = require("./companyJobRoute");

//Re-route into other resource router
router.use("/:companyId/invite", inviteRouter);
router.use("/:companyId/users", usersRouter);
router.use("/:companyId/jobsite", jobsiteRouter);
router.use("/:companyId/department", departmentRouter);
router.use("/:companyId/job", companyJobRoute);
router.use("/:companyId/activity", timesheetRouter);

router
  .route("/")
  .post(protect, authorize("admin"), createCompany)
  .get(
    protect,
    advancedResults(Company, {
      path: "users",
      select: "name email role isEmailConfirmed",
    }),

    getCompanies
  );

router.route("/:id/photo").put(protect, authorize("admin"), companyPhotoUpload);

router
  .route("/:id")
  .get(getCompany)
  .put(protect, authorize("admin"), updateCompany)
  .delete(protect, authorize("admin", deleteCompany));

router
  .route("/:id/clockinrestrictions")
  .put(protect, authorize("admin", "manager"), updateClockInRestrictions);

module.exports = router;
