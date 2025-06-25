const express = require('express');
const router = express.Router();

const verifyToken = require("../verifyToken");
const adminAuth = require('../middleware/adminAuth');

const {
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  getUserStats,
  createUser,
  toggleUserStatus,
  toggleAdminRole
} = require("./user.controller");

router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.get("/find/:id", getUser);

router.get("/", adminAuth, getAllUsers);
router.get("/stats", adminAuth, getUserStats);
router.post("/create", adminAuth, createUser);
router.patch("/:id/toggle-status", adminAuth, toggleUserStatus);
router.patch("/:id/toggle-admin", adminAuth, toggleAdminRole);

module.exports = router;
