const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'Award' }, // Lucide icon name, e.g. Trophy, Shield, Star
  unlockRule: {
    metric: { type: String, enum: ['XP', 'CompletedChallenges', 'CompletedCsrActivities'], required: true },
    threshold: { type: Number, required: true }
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
