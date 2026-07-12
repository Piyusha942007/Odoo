const Notification = require('../models/Notification');
const NotificationSetting = require('../models/NotificationSetting');

// Get all notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Create a notification
exports.createNotification = async (req, res, next) => {
  try {
    const { type, title, message, recipient, referenceId, referenceModel } = req.body;

    // Check notification settings
    const settings = await NotificationSetting.findOne({ userId: 'default' });
    if (settings) {
      if (type === 'Compliance Issue' && !settings.complianceIssueEnabled) {
        return res.json({ success: true, ignored: true, message: 'Compliance Issue notifications are disabled in settings' });
      }
      if (type === 'Policy Reminder' && !settings.policyReminderEnabled) {
        return res.json({ success: true, ignored: true, message: 'Policy Reminder notifications are disabled in settings' });
      }
      if (type === 'Approval Decision' && !settings.approvalDecisionEnabled) {
        return res.json({ success: true, ignored: true, message: 'Approval Decision notifications are disabled in settings' });
      }
      if (type === 'Badge Unlock' && !settings.badgeUnlockEnabled) {
        return res.json({ success: true, ignored: true, message: 'Badge Unlock notifications are disabled in settings' });
      }
    }

    const notification = new Notification({
      type,
      title,
      message,
      recipient,
      referenceId,
      referenceModel
    });

    const savedNotification = await notification.save();
    res.status(201).json({ success: true, data: savedNotification });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read or unread
exports.updateNotificationReadStatus = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format' });
    }
    const { read } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read },
      { new: true, runValidators: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format' });
    }
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Notification Settings
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await NotificationSetting.findOne({ userId: 'default' });
    if (!settings) {
      // Seed default settings
      settings = new NotificationSetting({ userId: 'default' });
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// Update Notification Settings
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await NotificationSetting.findOneAndUpdate(
      { userId: 'default' },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
