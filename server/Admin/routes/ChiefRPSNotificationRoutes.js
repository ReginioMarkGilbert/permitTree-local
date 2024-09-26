const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const {
    createNotification,
    getChiefRPSNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount,
    markNotificationAsUnread
} = require('../controllers/ChiefRPSNotificationControllers');

router.post('/notifications', authenticateToken, createNotification);
router.get('/notifications', authenticateToken, getChiefRPSNotifications);
router.patch('/notifications/:id/read', authenticateToken, markNotificationAsRead);
router.get('/notifications/unread-count', authenticateToken, getUnreadNotificationCount);
router.patch('/notifications/:id/unread', authenticateToken, markNotificationAsUnread);

module.exports = router;
