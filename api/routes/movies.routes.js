const express = require('express');
const router = express.Router();
const verifyToken = require('../verifyToken');
const adminAuth = require('../middleware/adminAuth');
const { uploadFields } = require('../config/cloudinary');

const {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovie,
  getAllMovies
} = require('./movie.controller');

// Публічні маршрути
router.get('/', getAllMovies);
router.get('/:id', getMovie);

// Захищені маршрути (тільки для адміністраторів)
router.post('/', verifyToken, adminAuth, uploadFields, createMovie);
router.put('/:id', verifyToken, uploadFields, updateMovie);
router.delete('/:id', verifyToken, deleteMovie);

module.exports = router;
