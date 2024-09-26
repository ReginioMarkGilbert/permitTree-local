const ChiefRPSNotification = require('../models/ChiefRPSNotificationSchema');

const createNotification = async (req, res) => {
    try {
        const { message, applicationId, userId, type } = req.body;
        const newNotification = new ChiefRPSNotification({
            message,
            applicationId,
            userId,
            type
        });
        await newNotification.save();
        res.status(201).json({ success: true, notification: newNotification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ success: false, message: 'Error creating notification' });
    }
};

const getChiefRPSNotifications = async (req, res) => {
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
};

const markNotificationAsRead = async (req, res) => {
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
};

const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await ChiefRPSNotification.countDocuments({ read: false });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        res.status(500).json({ message: 'Error fetching unread notification count' });
    }
};

const markNotificationAsUnread = async (req, res) => {
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
};

const deleteNotification = async (req, res) => {
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
};

module.exports = {
    createNotification,
    getChiefRPSNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount,
    markNotificationAsUnread,
    deleteNotification
};
