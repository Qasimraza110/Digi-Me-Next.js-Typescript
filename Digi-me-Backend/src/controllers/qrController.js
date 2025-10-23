const QRCode = require('qrcode');
const User = require('../models/User');

async function generateMyQr(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const baseUrl = process.env.PUBLIC_PROFILE_BASE_URL || (process.env.FRONTEND_URL || 'http://localhost:3000');
  const profileUrl = `${baseUrl}/u/${encodeURIComponent(user.username || user._id.toString())}`;
  const type = (req.query.type || 'png').toLowerCase();
  const opts = { margin: 1, scale: 8 }; // readable defaults

  try {
    if (type === 'svg') {
      const svg = await QRCode.toString(profileUrl, { ...opts, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }
    const pngBuffer = await QRCode.toBuffer(profileUrl, opts);
    res.setHeader('Content-Type', 'image/png');
    return res.send(pngBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate QR' });
  }
}

async function scanQR(req, res) {
  const { qrData } = req.body;
  if (!qrData) return res.status(400).json({ message: 'QR data is required' });

  try {
    // Extract username or ID from QR URL
    // Expected format: http://localhost:3000/u/username or http://localhost:3000/u/userId
    const urlMatch = qrData.match(/\/u\/([^\/\?]+)/);
    if (!urlMatch) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const identifier = decodeURIComponent(urlMatch[1]);
    let user;

    // Try to find by username first, then by ID
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      user = await User.findById(identifier).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
    } else {
      // It's a username
      user = await User.findOne({ username: identifier }).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
    }

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const publicProfile = {
      id: user._id,
      username: user.username,
      bio: user.bio,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      socialLinks: user.socialLinks,
      businessLinks: user.businessLinks,
      qrCodeUrl: user.qrCodeUrl,
    };

    res.json({ 
      message: 'Profile found',
      profile: publicProfile 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process QR code' });
  }
}

module.exports = { generateMyQr, scanQR };


