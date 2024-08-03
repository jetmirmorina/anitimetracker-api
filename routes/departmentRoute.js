const express = require("express");
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  addUsers,
  getMembers,
  deleteMember,
} = require("../controllers/departmentController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
router.use(protect);
router.use(authorize("admin", "managers"));

router.route("/").post(createDepartment).get(getDepartments);
router
  .route("/:id")
  .get(getDepartment)
  .put(updateDepartment)
  .delete(deleteDepartment);

router.route("/:id/member").put(addUsers).get(getMembers);

router.route("/:id/member/:userId").delete(deleteMember);

module.exports = router;
