const mongoose = require('mongoose');

// Ping MongoDB every 30 seconds to keep connection alive
const keepAlive = () => {
  setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        console.log('💓 MongoDB keepalive ping');
      } catch (error) {
        console.error('❌ Keepalive ping failed:', error.message);
      }
    }
  }, 30000); // Every 30 seconds
};

module.exports = keepAlive;