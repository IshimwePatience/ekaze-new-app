const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, protectOptional } = require('../middleware/auth');

router.get('/unread-count', protectOptional, notificationController.getUnreadCount);

router.use(protect);
router.get('/statistics', notificationController.getStatistics);
router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotification);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/clear-read', notificationController.clearRead);
router.post('/:id/mark-read', notificationController.markAsRead);
router.post('/:id/mark-unread', notificationController.markAsUnread);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
