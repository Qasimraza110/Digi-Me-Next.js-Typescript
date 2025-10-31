const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ Missing MongoDB connection string. Please set MONGODB_URI in your .env file.');
    throw new Error('Missing MONGODB_URI');
  }

  const mongooseOptions = {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
    family: 4,
  };

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    isConnected = false;
  });

  try {
    await mongoose.connect(mongoUri, mongooseOptions);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    throw err;
  }
}

function connectionHealth() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectToDatabase, connectionHealth };
