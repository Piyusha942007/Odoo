const mongoose = require('mongoose');

const esgSettingsSchema = new mongoose.Schema({
  badgeAutoAward: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EsgSettings', esgSettingsSchema);
