const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .put(protect, updateProfile);

router.route('/:userId')
  .get(protect, getProfile);

module.exports = router;
