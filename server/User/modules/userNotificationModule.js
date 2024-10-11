const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Schema
const userNotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

// Combined route handlers and routes
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20; // Default to 20 if no limit is provided
        const notifications = await UserNotification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

router.delete('/notifications/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await UserNotification.findOneAndDelete({ _id: id, userId: req.user.id });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or you do not have permission to delete it' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
});

router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await UserNotification.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or you do not have permission to update it' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

router.patch('/notifications/:id/unread', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await UserNotification.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { read: false },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or you do not have permission to update it' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as unread:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

router.get('/notifications/unread-count', authenticateToken, async (req, res) => {
    try {
        const count = await UserNotification.countDocuments({ userId: req.user.id, read: false });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        res.status(500).json({ message: 'Error fetching unread notification count' });
    }
});

router.post('/notifications/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await UserNotification.updateMany(
            { userId: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

module.exports = {
    router,
    UserNotification
};
