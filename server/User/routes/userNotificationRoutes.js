const express = require('express');
const router = express.Router();
const { getUserNotifications, deleteNotification, markNotificationAsRead, markNotificationAsUnread, getUnreadNotificationCount, markAllNotificationsAsRead } = require('../controllers/userNotificationController');
const { authenticateToken } = require('../../middleware/authMiddleware');


router.get('/notifications', authenticateToken, getUserNotifications);
router.delete('/notifications/:id', authenticateToken, deleteNotification);
router.patch('/notifications/:id/read', authenticateToken, markNotificationAsRead);
router.patch('/notifications/:id/unread', authenticateToken, markNotificationAsUnread);
router.get('/notifications/unread-count', authenticateToken, getUnreadNotificationCount);
router.post('/notifications/mark-all-read', authenticateToken, markAllNotificationsAsRead);

module.exports = router;
