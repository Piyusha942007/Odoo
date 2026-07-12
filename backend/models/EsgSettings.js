const mongoose = require('mongoose');

const esgSettingsSchema = new mongoose.Schema({
  badgeAutoAward: { type: Boolean, default: true },
  csrEvidenceRequired: { type: Boolean, default: false },
  
  // Social Score Sub-weights (Must sum to 100)
  weightCsr: { type: Number, default: 25 },
  weightChallenge: { type: Number, default: 25 },
  weightTraining: { type: Number, default: 25 },
  weightDiversity: { type: Number, default: 25 }
}, { timestamps: true });

module.exports = mongoose.model('EsgSettings', esgSettingsSchema);
