const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

const {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
  toggleGenreStatus,
  updateGenreOrder,
  searchGenres
} = require('./genre.controller');

// Публічні маршрути
router.get('/', getAllGenres);
router.get('/search', searchGenres);
router.get('/:id', getGenreById);

// Захищені маршрути (тільки для адміністраторів)
router.post('/', adminAuth, createGenre);
router.put('/:id', adminAuth, updateGenre);
router.delete('/:id', adminAuth, deleteGenre);
router.patch('/:id/toggle-status', adminAuth, toggleGenreStatus);
router.patch('/update-order', adminAuth, updateGenreOrder);

module.exports = router;