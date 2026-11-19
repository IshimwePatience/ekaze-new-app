const { Notification, User, Employer, Worker, Employment } = require('../models');
const { checkAndProcessSalaryNotifications } = require('../services/salaryPaymentNotificationService');

const getNotifications = async (req, res, next) => {
  try {
    // Check employer 5-day payroll daily reminders, overdue alerts, agency escalations & admin alerts
    await checkAndProcessSalaryNotifications().catch(() => {});

    const whereClause = { user_id: req.user.id };
    if (req.query.type) {
      whereClause.type = req.query.type;
    }
    if (req.query.is_read !== undefined) {
      whereClause.is_read = req.query.is_read === 'true';
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false }
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unread_count: unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

const getNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await notification.save();
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    return res.status(200).json({ success: true, message: 'Marked as read', data: notification });
  } catch (error) {
    next(error);
  }
};

const markAsUnread = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.is_read = false;
    notification.read_at = null;
    await notification.save();

    return res.status(200).json({ success: true, message: 'Marked as unread', data: notification });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const count = userId ? await Notification.count({
      where: { user_id: userId, is_read: false }
    }) : 0;
    return res.status(200).json({
      success: true,
      data: { unread_count: count },
      unread_count: count
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: { unread_count: 0 },
      unread_count: 0
    });
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: req.user.id, is_read: false } }
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const clearRead = async (req, res, next) => {
  try {
    await Notification.destroy({
      where: { user_id: req.user.id, is_read: true }
    });
    return res.status(200).json({ success: true, message: 'Read notifications cleared successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.destroy({
      where: { id, user_id: req.user.id }
    });
    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const total = await Notification.count({ where: { user_id: req.user.id } });
    const unread = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
    const read = total - unread;

    return res.status(200).json({
      success: true,
      data: {
        total,
        unread,
        read,
        by_type: {}
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getNotification,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  clearRead,
  deleteNotification,
  getStatistics
};
