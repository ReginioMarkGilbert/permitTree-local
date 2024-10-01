const UserNotification = require('../models/userNotificationSchema');

const getUserNotifications = async (req, res) => {
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
};

const deleteNotification = async (req, res) => {
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
};

const markNotificationAsRead = async (req, res) => {
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
};

const markNotificationAsUnread = async (req, res) => {
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
};

const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await UserNotification.countDocuments({ userId: req.user.id, read: false });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        res.status(500).json({ message: 'Error fetching unread notification count' });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
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
};

module.exports = {
    getUserNotifications,
    deleteNotification,
    markNotificationAsRead,
    markNotificationAsUnread,
    getUnreadNotificationCount,
    markAllNotificationsAsRead
};
