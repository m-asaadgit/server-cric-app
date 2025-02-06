const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true, // Ensure each token is stored only once
  },
 
}, { timestamps: true });

// Automatically delete expired tokens using an index
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Blacklist", blacklistSchema);


