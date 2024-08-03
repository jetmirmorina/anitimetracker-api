const express = require("express");

const {
  getAllUsers,
  getUser,
  deleteUser,
  userPhotoUpload,
  updateUserRole,
  updateUserFullName,
} = require("../controllers/userController");
const User = require("../models/userModel");

const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    protect,
    advancedResults(User, { path: "companies", select: "name" }),
    getAllUsers
  );

router
  .route("/:id")
  .get(protect, authorize("admin"), getUser)
  .delete(protect, authorize("admin"), deleteUser);

router.route("/:id/role").put(protect, updateUserRole);

router.route("/:id/photo").put(protect, userPhotoUpload);

router.route("/:id/name").put(protect, updateUserFullName);

module.exports = router;
