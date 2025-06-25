const express = require('express');
const router = express.Router();

const {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  forgotPassword,
  resetPassword
} = require("./auth.controller");

router.post("/register", registerUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

