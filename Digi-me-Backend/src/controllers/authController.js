const crypto = require('crypto');
const { getTransporter } = require('../config/mailer');
const User = require('../models/User');
const { issueToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

async function register(req, res) {
  const { email, password, username } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!emailRegex.test(normalizedEmail)) return res.status(400).json({ message: 'Invalid email format' });
  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email: normalizedEmail, passwordHash, username });
    const token = issueToken(user._id.toString());
    res.status(201).json({ token, user: sanitiseUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!emailRegex.test(normalizedEmail)) return res.status(400).json({ message: 'Invalid email format' });
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = issueToken(user._id.toString());
    res.json({ token, user: sanitiseUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
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

async function requestPasswordReset(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!emailRegex.test(normalizedEmail)) return res.status(400).json({ message: 'Invalid email format' });
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(200).json({ message: 'If account exists, email sent' });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const transporter = await getTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@digime.local',
      to: user.email,
      subject: 'Reset your DigiMe password',
      html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`
    });
    res.json({ message: 'If account exists, email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset email' });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed' });
  }
}

module.exports = { register, login, requestPasswordReset, resetPassword };
async function googleLogin(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'idToken required' });
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const avatarUrl = payload.picture || '';

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        email,
        passwordHash: await User.hashPassword(crypto.randomBytes(12).toString('hex')),
        googleId,
        avatarUrl,
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    const token = issueToken(user._id.toString());
    res.json({ token, user: {
      id: user._id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      socialLinks: user.socialLinks,
      businessLinks: user.businessLinks,
    }});
  } catch (err) {
    res.status(401).json({ message: 'Google token invalid' });
  }
}

module.exports.googleLogin = googleLogin;


