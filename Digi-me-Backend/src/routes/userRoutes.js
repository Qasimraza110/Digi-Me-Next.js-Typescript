// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
