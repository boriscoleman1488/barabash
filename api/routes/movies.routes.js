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
  getAllMovies,
  searchMovies,
  getMoviesByGenre,
  getMoviesByCategory,
  getMoviesStats
} = require('./movie.controller');

// Публічні маршрути
router.get('/', getAllMovies);
router.get('/search', searchMovies);
router.get('/stats', getMoviesStats);
router.get('/genre/:genre', getMoviesByGenre);
router.get('/category/:category', getMoviesByCategory);
router.get('/:id', getMovie);

// Захищені маршрути (тільки для адміністраторів)
router.post('/', adminAuth, uploadFields, createMovie);
router.put('/:id', adminAuth, uploadFields, updateMovie);
router.delete('/:id', adminAuth, deleteMovie);

module.exports = router;