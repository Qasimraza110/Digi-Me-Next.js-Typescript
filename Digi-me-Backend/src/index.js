const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./config/db');
const { getTransporter } = require('./config/mailer');

const qrRoutes = require("./routes/qr");
const savedRoutes = require("./routes/saved");
const userRoutes = require("./routes/userRoutes"); // ✅ Added missing import

// ✅ Always load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// ✅ Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/qr", qrRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/users", userRoutes);

// ✅ Healthcheck route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    db: process.env.MONGO_URI ? 'configured' : 'missing',
  });
});

// ✅ Test email route
app.get('/test-email', async (req, res) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USERNAME,
      subject: 'DigiMe Test Email',
      text: '✅ This is a test email from DigiMe backend.',
    });

    console.log(info);
    res.json({ message: 'Email sent', info });
  } catch (error) {
    console.error('❌ Email send error:', error);
    res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
});

// ✅ Optional: central routes file (if you have `src/routes/index.js`)
try {
  app.use('/api', require('./routes'));
} catch (e) {
  console.warn('⚠️ No central routes/index.js found — skipping.');
}

const PORT = process.env.PORT || 5000;

// ✅ Start server
async function start() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Fatal startup error:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
