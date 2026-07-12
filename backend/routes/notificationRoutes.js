const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  updateNotificationReadStatus,
  deleteNotification,
  getSettings,
  updateSettings
} = require('../controllers/notificationController');

// Notification Settings endpoints (placed above /:id to prevent parameter conflict)
router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

// CRUD Notification endpoints
router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/:id')
  .put(updateNotificationReadStatus)
  .delete(deleteNotification);

module.exports = router;
