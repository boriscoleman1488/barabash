const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const adminAuth = require('../middleware/adminAuth');

router.get('/', categoryController.getAllCategories);
router.get('/search', categoryController.searchCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/movies', categoryController.getCategoryMovies);

router.post('/', adminAuth, categoryController.createCategory);
router.put('/:id', adminAuth, categoryController.updateCategory);
router.delete('/:id', adminAuth, categoryController.deleteCategory);
router.patch('/:id/toggle-status', adminAuth, categoryController.toggleCategoryStatus);
router.post('/:id/movies', adminAuth, categoryController.addMovieToCategory);
router.delete('/:id/movies/:movieId', adminAuth, categoryController.removeMovieFromCategory);

module.exports = router;