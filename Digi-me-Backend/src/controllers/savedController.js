const User = require('../models/User');
const mongoose = require("mongoose");
const Fuse = require('fuse.js');

// async function listSaved(req, res) {
//   const me = await User.findById(req.user.id).populate('savedProfiles', 'username avatarUrl bio');
//   res.json(me.savedProfiles.map((u) => ({ id: u._id, username: u.username, avatarUrl: u.avatarUrl, bio: u.bio })));
// }

async function addSaved(req, res) {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId)
      return res.status(400).json({ message: 'targetUserId required' });

    if (targetUserId === req.user.id)
      return res.status(400).json({ message: 'Cannot save yourself' });

    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ message: 'User not found' });

    const targetId = new mongoose.Types.ObjectId(targetUserId);

    const exists = me.savedProfiles.some(
      (id) => id.toString() === targetId.toString()
    );

    if (!exists) {
      me.savedProfiles.push(targetId);
      await me.save();
    }

    res.json({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error('❌ addSaved error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}


// async function removeSaved(req, res) {
//   const { targetUserId } = req.body;
//   if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
//   const me = await User.findById(req.user.id);
//   me.savedProfiles = me.savedProfiles.filter((id) => id.toString() !== targetUserId);
//   await me.save();
//   res.json({ message: 'Removed' });
// }
// async function searchSavedProfiles(req, res) {
//   try {
//     const userId = req.user?.id; // Auth middleware must set req.user
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });

//     const { q } = req.query;
//     const searchTerm = (q || '').trim();

//     // Fetch logged-in user with populated savedProfiles
//     const user = await User.findById(userId).populate('savedProfiles', 'username firstName lastName avatarUrl bio');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     let results = user.savedProfiles || [];

//     if (searchTerm) {
//       // Fuse.js fuzzy search
//       const fuse = new Fuse(results, {
//         keys: ['username', 'firstName', 'lastName'],
//         threshold: 0.4, // typo-tolerance
//         includeScore: false,
//       });

//       results = fuse.search(searchTerm).map(r => r.item);
//     }

//     // Return minimal fields for frontend
//     const output = results.map(u => ({
//       id: u._id,
//       username: u.username,
//       firstName: u.firstName,
//       lastName: u.lastName,
//       avatarUrl: u.avatarUrl,
//       bio: u.bio,
//     }));

//     res.json({ results: output });
//   } catch (err) {
//     console.error('Search error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }


async function listSaved(req, res) {
  try {
    const me = await User.findById(req.user.id).populate("savedProfiles");
    if (!me) return res.status(404).json({ message: "User not found" });

    const savedProfiles = me.savedProfiles.map((u) => ({
      id: u._id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      bio: u.bio,
      website: u.website,
      profileImage: u.avatarUrl,
      savedAt: u.createdAt,
    }));

    res.json(savedProfiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Search saved profiles with Fuse.js
async function searchSavedProfiles(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { q } = req.query;
    const searchTerm = (q || "").trim();

    // fetch logged-in user's saved profiles
    const user = await User.findById(userId).populate('savedProfiles');
    if (!user) return res.status(404).json({ message: "User not found" });

    let results = user.savedProfiles || [];

    if (searchTerm) {
      const fuse = new Fuse(results, {
        keys: ["username", "firstName", "lastName"],
        threshold: 0.4,
        includeScore: true,
      });
      results = fuse.search(searchTerm).map(r => r.item);
    }

    // always return array
    res.json({ results: results.map(u => ({
      id: u._id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      bio: u.bio,
      website: u.website,
      profileImage: u.avatarUrl,
      savedAt: u.createdAt,
    })) });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function removeSaved(req, res) {
  try {
    const targetUserId = req.params.id || req.body.targetUserId;

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId required" });
    }

    const me = await User.findById(req.user.id);
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    const beforeCount = me.savedProfiles.length;

    me.savedProfiles = me.savedProfiles.filter(
      (id) => id.toString() !== targetUserId
    );
    await me.save();

    if (me.savedProfiles.length === beforeCount) {
      return res.status(404).json({ message: "Saved profile not found" });
    }

    res.json({ message: "Profile removed successfully" });
  } catch (error) {
    console.error("❌ removeSaved error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}





// ✅ Export all functions
module.exports = { listSaved, addSaved, removeSaved, searchSavedProfiles };

