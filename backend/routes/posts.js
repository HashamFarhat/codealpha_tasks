const express = require('express');
const { getPosts, createPost, likePost, commentPost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router.route('/:id/like').put(protect, likePost);
router.route('/:id/comment').post(protect, commentPost);

module.exports = router;
