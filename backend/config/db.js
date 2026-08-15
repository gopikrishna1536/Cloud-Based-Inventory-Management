const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isPlaceholder = !uri || uri.includes('USERNAME:PASSWORD') || uri.includes('YOUR_USERNAME') || uri.includes('<db_password>');

  if (!isPlaceholder) {
    try {
      console.log('Connecting to MongoDB Atlas Cloud Database...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 6000,
      });
      isConnected = true;
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

      // Auto-seed Atlas if clean database
      try {
        const Organization = require('../models/Organization');
        const count = await Organization.countDocuments();
        if (count === 0) {
          console.log('🌱 Empty MongoDB Atlas database detected. Auto-seeding initial organization, products, and catalog data...');
          const seedDatabase = require('../utils/seedHelper');
          await seedDatabase();
        }
      } catch (seedErr) {
        console.warn('Auto-seed check note:', seedErr.message);
      }

      return;
    } catch (error) {
      console.warn(`⚠️ Atlas connection failed (${error.message}). Operating in Mock/In-Memory mode.`);
    }
  } else {
    console.log('ℹ️ MONGODB_URI contains placeholder (<db_password>). Update your password in backend/.env to connect Atlas.');
  }
};

const getIsConnected = () => isConnected;

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
