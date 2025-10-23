const User = require('../models/User');

async function listSaved(req, res) {
  const me = await User.findById(req.user.id).populate('savedProfiles', 'username avatarUrl bio');
  res.json(me.savedProfiles.map((u) => ({ id: u._id, username: u.username, avatarUrl: u.avatarUrl, bio: u.bio })));
}

async function addSaved(req, res) {
  const { targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
  if (targetUserId === req.user.id) return res.status(400).json({ message: 'Cannot save yourself' });
  const me = await User.findById(req.user.id);
  if (!me) return res.status(404).json({ message: 'Not found' });
  const exists = me.savedProfiles.some((id) => id.toString() === targetUserId);
  if (!exists) me.savedProfiles.push(targetUserId);
  await me.save();
  res.json({ message: 'Saved' });
}

async function removeSaved(req, res) {
  const { targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
  const me = await User.findById(req.user.id);
  me.savedProfiles = me.savedProfiles.filter((id) => id.toString() !== targetUserId);
  await me.save();
  res.json({ message: 'Removed' });
}

module.exports = { listSaved, addSaved, removeSaved };


