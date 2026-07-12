const Notification = require('../models/Notification');
const NotificationSetting = require('../models/NotificationSetting');

/**
 * Creates a notification programmatically in the backend.
 * Verifies that the specific notification type is enabled in the user settings before saving.
 *
 * @param {Object} params
 * @param {string} params.type - One of 'Compliance Issue', 'Approval Decision', 'Policy Reminder', 'Badge Unlock'
 * @param {string} params.title - Title of notification
 * @param {string} params.message - Body text of notification
 * @param {string} [params.recipient='All'] - Targeted recipient
 * @param {string} [params.referenceId] - ObjectId reference
 * @param {string} [params.referenceModel] - Ref collection name
 * @returns {Promise<Object|null>} Saved notification document or null if disabled
 */
async function triggerNotification({ type, title, message, recipient = 'All', referenceId = null, referenceModel = null }) {
  try {
    // Retrieve default notification preferences
    const settings = await NotificationSetting.findOne({ userId: 'default' });
    if (settings) {
      if (type === 'Compliance Issue' && !settings.complianceIssueEnabled) return null;
      if (type === 'Policy Reminder' && !settings.policyReminderEnabled) return null;
      if (type === 'Approval Decision' && !settings.approvalDecisionEnabled) return null;
      if (type === 'Badge Unlock' && !settings.badgeUnlockEnabled) return null;
    }

    const notification = new Notification({
      type,
      title,
      message,
      recipient,
      referenceId,
      referenceModel
    });

    return await notification.save();
  } catch (error) {
    console.error('Failed to trigger notification programmatically:', error.message);
    return null;
  }
}

module.exports = {
  triggerNotification
};
