const mongoose = require('mongoose');

const notificationSettingSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default',
    unique: true
  },
  complianceIssueEnabled: {
    type: Boolean,
    default: true
  },
  policyReminderEnabled: {
    type: Boolean,
    default: true
  },
  approvalDecisionEnabled: {
    type: Boolean,
    default: true
  },
  badgeUnlockEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models.NotificationSetting || mongoose.model('NotificationSetting', notificationSettingSchema);
