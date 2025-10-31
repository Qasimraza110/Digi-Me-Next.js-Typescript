const crypto = require('crypto');
const { getTransporter } = require('../config/mailer');
const User = require('../models/User');
const { issueToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const { validateUsername, validatePassword, validateEmail } = require('../utils/validation');
const bcrypt = require("bcryptjs");


async function register(req, res) {
  const { email, password, username } = req.body;
  
  // Basic required field validation
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  
  // Email validation
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) return res.status(400).json({ message: emailValidation.message });
  
  // Username validation
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) return res.status(400).json({ message: usernameValidation.message });
  
  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) return res.status(400).json({ message: passwordValidation.message });
  
  try {
    // Check if email already exists
    const existingEmail = await User.findOne({ email: emailValidation.normalized });
    if (existingEmail) return res.status(409).json({ message: 'Email already in use' });
    
    // Check if username already exists (if provided)
    if (username) {
      const usernameStr = String(username).trim();
      const existingUsername = await User.findOne({ username: usernameStr });
      if (existingUsername) return res.status(409).json({ message: 'Username already in use' });
    }
    
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ 
      email: emailValidation.normalized, 
      passwordHash, 
      username: username ? String(username).trim() : undefined 
    });
    const token = issueToken(user._id.toString());
    res.status(201).json({ 
      token, 
      user: sanitiseUser(user),
      passwordStrength: passwordValidation.strength 
    });
  } catch (err) {
    console.error('Registration error:', err);
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

async function requestPasswordReset (req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res
        .status(200)
        .json({ message: "If account exists, email sent successfully" });

    // Generate reset token and expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 1000 * 60 * 30; // 30 minutes

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send reset link
    const transporter = await getTransporter();
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Reset your DigiMe password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password (valid for 30 minutes):</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      `,
    });

    res.json({ message: "Reset link sent successfully (if account exists)" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error while sending reset link" });
  }
};

// ✅ 2️⃣ RESET PASSWORD
async function resetPassword (req, res) {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword)
    return res
      .status(400)
      .json({ message: "Token, new password, and confirm password are required." });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match." });

  try {
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token." });

    // Hash and update new password
    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password. Try again later." });
  }
};


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential required" });
    }

    console.log("Received credential ✅");
    console.log("Using Client ID:", process.env.GOOGLE_CLIENT_ID);

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // ✅ Sanitize username (only letters, numbers, underscores)
    const safeUsername = (name || email.split("@")[0])
      .replace(/[^a-zA-Z0-9_]/g, "_") // replace everything except allowed chars
      .toLowerCase();

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      const randomPassword = crypto.randomBytes(12).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        email,
        googleId,
        username: safeUsername, // ✅ Use sanitized username here
        avatarUrl: picture || "",
        passwordHash,
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (picture) user.avatarUrl = picture; 
      await user.save();
    }

    const token = issueToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        socialLinks: user.socialLinks,
        businessLinks: user.businessLinks,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(401).json({ message: error.message || "Google token invalid" });
  }
}



module.exports = { register, login, requestPasswordReset, resetPassword, googleLogin };


