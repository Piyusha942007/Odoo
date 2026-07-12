const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  pointsSpent: { type: Number, required: true, min: 0 },
  redeemedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Redemption', redemptionSchema);
