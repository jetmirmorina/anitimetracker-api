const express = require("express");

const {
  registerUser,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  confirmEmail,
  logout,
  checkEmail,
} = require("../controllers/authController");
const Company = require("../models/companyModel");
const User = require("../models/userModel");

const advancedResults = require("../middleware/advancedResults");

const router = express.Router();
const { protect } = require("../middleware/auth");

router.post("/checkemail", checkEmail);
router.post("/register", registerUser);
router.get("/confirmemail", confirmEmail);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
