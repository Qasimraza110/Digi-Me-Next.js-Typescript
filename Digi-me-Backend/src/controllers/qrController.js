const QRCode = require("qrcode");
const User = require("../models/User");

async function generateMyQr(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const baseUrl =
    process.env.PUBLIC_PROFILE_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

  const profileUrl = `${baseUrl}/u/${encodeURIComponent(
    user.username || user._id.toString()
  )}`;

  try {
    const qrPng = await QRCode.toDataURL(profileUrl, {
      margin: 1,
      scale: 8,
    });

    // Optional: store QR in user model
    user.qrCodeUrl = qrPng;
    await user.save();

    res.json({
      profileUrl,
      qrCode: qrPng,
    });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ message: "Failed to generate QR" });
  }
}

async function scanQR(req, res) {
  const { qrData } = req.body;
  if (!qrData) return res.status(400).json({ message: "QR data required" });

  try {
    const match = qrData.match(/\/u\/([^\/\?]+)/);
    if (!match)
      return res.status(400).json({ message: "Invalid QR code format" });

    const identifier = decodeURIComponent(match[1]);

    let user =
      identifier.match(/^[0-9a-fA-F]{24}$/) ?
      await User.findById(identifier).select("-passwordHash -resetPasswordToken -resetPasswordExpires") :
      await User.findOne({ username: identifier }).select("-passwordHash -resetPasswordToken -resetPasswordExpires");

    if (!user) return res.status(404).json({ message: "Profile not found" });

    res.json({
      message: "Profile found",
      profile: user,
    });
  } catch (err) {
    console.error("Scan QR error:", err);
    res.status(500).json({ message: "QR scan failed" });
  }
}

module.exports = { generateMyQr, scanQR };
