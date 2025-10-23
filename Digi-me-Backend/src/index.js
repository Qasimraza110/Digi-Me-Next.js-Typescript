const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./config/db');

// Always load the .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

//  Healthcheck route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    db: process.env.MONGO_URI ? 'configured' : 'missing',
  });
});

// Main API routes
app.use('/api', require('./routes')); // Make sure src/routes/index.js exists

const PORT = process.env.PORT || 5000;

//  Start the server
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
