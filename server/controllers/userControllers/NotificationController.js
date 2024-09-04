const Notification = require('../../models/User/Notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ read: false });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead
};
