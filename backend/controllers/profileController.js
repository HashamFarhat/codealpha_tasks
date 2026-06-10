const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile & posts
// @route   GET /api/profiles/:userId
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar bio')
      .populate('comments.user', 'username avatar bio');

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatarUrl,
        createdAt: user.createdAt,
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (bio & avatar)
// @route   PUT /api/profiles
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { bio, avatar } = req.body;

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatarUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
