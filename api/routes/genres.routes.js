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
  updateGenreOrder
} = require('./genre.controller');



router.get('/', getAllGenres);
router.get('/:id', getGenreById);

router.post('/', adminAuth, createGenre);
router.put('/:id', adminAuth, updateGenre);
router.delete('/:id', adminAuth, deleteGenre);
router.patch('/:id/toggle-status', adminAuth, toggleGenreStatus);
router.patch('/update-order', adminAuth, updateGenreOrder);

module.exports = router;