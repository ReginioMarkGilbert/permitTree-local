const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Schema
const chiefRPSNotificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const ChiefRPSNotification = mongoose.model('ChiefRPSNotification', chiefRPSNotificationSchema);

// Routes
router.post('/notifications', authenticateToken, async (req, res) => {
    try {
        const { message, applicationId, userId, type } = req.body;

        let formattedType;
        if (Array.isArray(type)) {
            formattedType = type
                .join(' ')
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        } else if (typeof type === 'string') {
            formattedType = type
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        } else {
            throw new Error('Invalid type format');
        }

        const newNotification = new ChiefRPSNotification({
            message,
            applicationId,
            userId,
            type: formattedType
        });
        await newNotification.save();
        res.status(201).json({ success: true, notification: newNotification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ success: false, message: 'Error creating notification' });
    }
});

router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await ChiefRPSNotification.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'firstName lastName');
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching Chief RPS notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await ChiefRPSNotification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

router.get('/notifications/unread-count', authenticateToken, async (req, res) => {
    try {
        const count = await ChiefRPSNotification.countDocuments({ read: false });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        res.status(500).json({ message: 'Error fetching unread notification count' });
    }
});

router.patch('/notifications/:id/unread', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await ChiefRPSNotification.findByIdAndUpdate(
            id,
            { read: false },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as unread:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

router.delete('/notifications/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await ChiefRPSNotification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
});

router.post('/notifications/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await ChiefRPSNotification.updateMany(
            { read: false },
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
    ChiefRPSNotification
};
