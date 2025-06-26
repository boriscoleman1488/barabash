const express = require('express');
const router = express.Router();

const verifyToken = require("../verifyToken");
const adminAuth = require('../middleware/adminAuth');

const {
  updateUser,
  deleteUser,
  getUser,
  getUserProfile,
  addToFavorites,
  removeFromFavorites,
  getFavoriteMovies,
  getPurchasedMovies,
  checkMovieAccess,
  getAllUsers,
  getUserStats,
  createUser,
  toggleUserStatus,
  toggleAdminRole
} = require("./user.controller");

// Маршрути для користувачів
router.get("/profile", verifyToken, getUserProfile);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.get("/find/:id", getUser);

// Маршрути для роботи з улюбленими фільмами
router.post("/favorites", verifyToken, addToFavorites);
router.delete("/favorites/:movieId", verifyToken, removeFromFavorites);
router.get("/favorites", verifyToken, getFavoriteMovies);

// Маршрути для роботи з придбаними фільмами
router.get("/purchased", verifyToken, getPurchasedMovies);
router.get("/access/:movieId", verifyToken, checkMovieAccess);

// Адміністративні маршрути
router.get("/", adminAuth, getAllUsers);
router.get("/stats", adminAuth, getUserStats);
router.post("/create", adminAuth, createUser);
router.patch("/:id/toggle-status", adminAuth, toggleUserStatus);
router.patch("/:id/toggle-admin", adminAuth, toggleAdminRole);

module.exports = router;