/**
 * QueueEase V2 — Database Connection
 * MongoDB Atlas connection via Mongoose.
 */

const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      // Mongoose 8 defaults handle these
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
