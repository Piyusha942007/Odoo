const mongoose = require('mongoose');

const employeeBadgeSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  unlockedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate awards
employeeBadgeSchema.index({ employee: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('EmployeeBadge', employeeBadgeSchema);
