/**
 * QueueEase V2 — Notification Controller
 */

const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get my notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const filter = { userId: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });
    
    sendSuccess(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }
    
    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
