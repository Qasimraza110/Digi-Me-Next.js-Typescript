const path = require('path');
const fs = require('fs');
const Fuse = require('fuse.js');
const User = require('../models/User');

async function getMyProfile(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(sanitiseUser(user));
}

async function updateMyProfile(req, res) {
  const updates = filterProfileFields(req.body);
  if (req.file) {
    const relative = `/uploads/${req.file.filename}`;
    updates.avatarUrl = relative;
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
  res.json(sanitiseUser(user));
}

async function deleteMyProfile(req, res) {
  await User.findByIdAndDelete(req.user.id);
  res.json({ message: 'Account deleted' });
}

async function getPublicProfileByUsername(req, res) {
  const { username } = req.params;
  const user = await User.findOne({ username }).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(publicUser(user));
}

async function getPublicProfileById(req, res) {
  const { id } = req.params;
  const user = await User.findById(id).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(publicUser(user));
}

// Fuzzy search profiles by username/email/bio/phone with typo tolerance
async function searchProfiles(req, res) {
  const { q } = req.query;
  const query = (q || '').toString().trim();
  if (!query) return res.status(400).json({ message: 'Missing query parameter q' });

  // Fetch a limited set to keep in-memory search efficient
  const candidates = await User.find({}, 'username email bio phone avatarUrl socialLinks businessLinks')
    .limit(1000)
    .lean();

  // Normalize query: collapse spaces; users may add extra spaces or minor typos
  const normalizedQuery = query.replace(/\s+/g, ' ').toLowerCase();

  const fuse = new Fuse(candidates, {
    includeScore: true,
    threshold: 0.4, // lower is stricter; 0.4 allows minor typos
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'username', weight: 0.6 },
      { name: 'email', weight: 0.3 },
      { name: 'bio', weight: 0.07 },
      { name: 'phone', weight: 0.03 },
    ],
  });

  const results = fuse.search(normalizedQuery).slice(0, 20);
  const data = results.map(r => publicUser(r.item));
  res.json({ query, count: data.length, results: data });
}

function filterProfileFields(body) {
  const allowed = ['username', 'bio', 'phone', 'socialLinks', 'businessLinks'];
  const updates = {};
  for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];
  return updates;
}

function sanitiseUser(user) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    bio: user.bio,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    socialLinks: user.socialLinks,
    businessLinks: user.businessLinks,
  };
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    bio: user.bio,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    socialLinks: user.socialLinks,
    businessLinks: user.businessLinks,
    qrCodeUrl: user.qrCodeUrl,
  };
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getPublicProfileByUsername,
  getPublicProfileById,
  searchProfiles,
};


