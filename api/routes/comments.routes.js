const express = require('express');
const router = express.Router();
const commentController = require('./comment.controller');
const verifyToken = require('../verifyToken');
const adminAuth = require('../middleware/adminAuth');


router.get('/', commentController.getAllComments);
router.get('/search', commentController.searchComments);
router.get('/movie/:movieId', commentController.getMovieComments);
router.get('/user/:userId', commentController.getUserComments);
router.get('/:id', commentController.getCommentById);

// Маршрути що потребують авторизації
router.post('/', verifyToken, commentController.createComment);
router.put('/:id', verifyToken, commentController.updateComment);
router.delete('/:id', verifyToken, commentController.deleteComment);

// Адміністративні маршрути
router.get('/admin/stats', adminAuth, commentController.getCommentsStats);

module.exports = router;