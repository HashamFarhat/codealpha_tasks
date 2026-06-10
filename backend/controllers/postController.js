const Post = require('../models/Post');

// Helper to populate user details in posts
const populatePostDetails = (query) => {
  return query
    .populate('user', 'username avatar bio')
    .populate('comments.user', 'username avatar bio');
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res, next) => {
  try {
    const posts = await populatePostDetails(Post.find().sort({ createdAt: -1 }));
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;

    if (!content && !image) {
      return res.status(400).json({ message: 'Post must contain content or an image' });
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      image,
    });

    const populatedPost = await populatePostDetails(Post.findById(post._id));

    // Emit real-time update if socket.io is attached
    if (req.io) {
      req.io.emit('newPost', populatedPost);
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Like / unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the post has already been liked by this user
    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike (remove userId)
      post.likes.splice(likeIndex, 1);
    } else {
      // Like (add userId)
      post.likes.push(req.user._id);
    }

    await post.save();

    const populatedPost = await populatePostDetails(Post.findById(post._id));

    // Emit real-time update
    if (req.io) {
      req.io.emit('postUpdated', populatedPost);
    }

    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentPost = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await populatePostDetails(Post.findById(post._id));

    // Emit real-time update
    if (req.io) {
      req.io.emit('postUpdated', populatedPost);
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPosts, createPost, likePost, commentPost };
