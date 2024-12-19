const express = require("express");
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { protect } = require("../middleware/auth");
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
const { 
  validateLogin, 
  validateRegistration,
  validateUpdateDetails,
  validateUpdatePassword 
} = require('../middleware/validateRequest');

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/checkemail", checkEmail);
router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginLimiter, login);
router.get("/confirmemail", confirmEmail);
router.post("/forgotpassword", forgotPasswordLimiter, forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.post("/logout", logout);
router.put("/updatedetails", validateUpdateDetails, updateDetails);
router.put("/updatepassword", validateUpdatePassword, updatePassword);

module.exports = router;
