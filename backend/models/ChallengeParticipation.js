const mongoose = require('mongoose');

const challengeParticipationSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  employee: { type: String, required: true },
  progress: { type: Number, min: 0, max: 100, default: 0 }, // progress %
  proof: { type: String }, // text or link
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  xpAwarded: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ChallengeParticipation', challengeParticipationSchema);
